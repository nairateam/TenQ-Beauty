'use client'

import { useMemo, useSyncExternalStore } from 'react'

import { currenciesConfig, priceField } from '@/lib/currencies'
import { imageOf, isDoc } from '@/lib/media'
import { toNaira } from '@/lib/pricing'
import type { Cart, Product, Variant, VariantOption } from '@/payload-types'
import type { ImageData } from '@/types/product'

/*
 * The bag, stored in Payload's carts collection and changed through the ecommerce plugin's
 * cart endpoints. A guest's cart id and secret are kept in localStorage; prices, the promo
 * discount and the subtotal all come from the server.
 *
 * Requests run one at a time, so quick clicks (or a product plus its add-on) can't race —
 * e.g. two adds before the cart exists would otherwise start two carts.
 */

export const MAX_QUANTITY = 10

// Same keys the plugin's React provider uses, so either can pick the cart up
const ID_KEY = 'cart'
const SECRET_KEY = 'cart_secret'

/** What to fetch for the cart: enough of each product to draw the bag. */
const cartQuery = toQuery({
  depth: 2,
  select: {
    items: true,
    subtotal: true,
    purchasedAt: true,
    promoCode: true,
    promo: true,
    giftNote: true,
    savedItems: true,
  },
  populate: {
    products: {
      title: true,
      slug: true,
      image: true,
      badge: true,
      shopCollections: true,
      enableVariants: true,
      [priceField]: true,
    },
    variants: { title: true, options: true, [priceField]: true },
    'shop-collections': { name: true },
  },
})

/** Nested params in Payload's bracket style: populate[products][title]=true */
function toQuery(value: Record<string, unknown>, prefix = ''): string {
  return Object.entries(value)
    .flatMap(([key, v]) => {
      const name = prefix ? `${prefix}[${key}]` : key
      return v && typeof v === 'object'
        ? [toQuery(v as Record<string, unknown>, name)]
        : [`${encodeURIComponent(name)}=${encodeURIComponent(String(v))}`]
    })
    .join('&')
}

/* ---------- Store ---------- */

type State = {
  /** False until the stored cart (if any) has been fetched */
  loaded: boolean
  busy: boolean
  cart: Cart | null
  /** The slide-out bag, and the lines added since it last opened */
  drawer: { open: boolean; justAdded: string[] }
}

const closed = { open: false, justAdded: [] }
let state: State = { loaded: false, busy: false, cart: null, drawer: closed }
const serverState: State = { loaded: false, busy: false, cart: null, drawer: closed }
const listeners = new Set<() => void>()
let started = false

function set(next: Partial<State>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

const storage = {
  get(key: string) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string | null) {
    try {
      if (value) window.localStorage.setItem(key, value)
      else window.localStorage.removeItem(key)
    } catch {
      // Storage blocked: the bag lasts for this visit only
    }
  },
}

const ids = () => ({ id: storage.get(ID_KEY), secret: storage.get(SECRET_KEY) })

function forgetCart() {
  storage.set(ID_KEY, null)
  storage.set(SECRET_KEY, null)
  set({ cart: null })
}

// One request at a time, in order
let queue: Promise<unknown> = Promise.resolve()
function run<T>(task: () => Promise<T>): Promise<T> {
  const next = queue.then(async () => {
    set({ busy: true })
    try {
      return await task()
    } finally {
      set({ busy: false })
    }
  })
  queue = next.catch(() => undefined)
  return next
}

async function api(path: string, init?: RequestInit & { json?: unknown }) {
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...(init?.json !== undefined ? { body: JSON.stringify(init.json) } : {}),
  })
  const body = await res.json().catch(() => null)
  return { ok: res.ok, status: res.status, body }
}

const secretParam = (secret: string | null) =>
  secret ? `&secret=${encodeURIComponent(secret)}` : ''

/** Reload the cart; a cart that's gone, inaccessible or already paid for is forgotten. */
async function fetchCart() {
  const { id, secret } = ids()
  if (!id) return set({ cart: null, loaded: true })
  const res = await api(`/carts/${id}?${cartQuery}${secretParam(secret)}`)
  if (res.ok && res.body && !res.body.purchasedAt) set({ cart: res.body as Cart, loaded: true })
  else {
    forgetCart()
    set({ loaded: true })
  }
}

/** The current cart's id, creating an empty cart first if there isn't one. */
async function ensureCart() {
  const { id } = ids()
  if (id && state.cart) return id
  const res = await api(`/carts?${cartQuery}`, {
    method: 'POST',
    json: { items: [], currency: currenciesConfig.defaultCurrency },
  })
  if (!res.ok || !res.body?.doc?.id) throw new Error('Could not start a bag.')
  storage.set(ID_KEY, res.body.doc.id)
  if (res.body.doc.secret) storage.set(SECRET_KEY, res.body.doc.secret)
  return res.body.doc.id as string
}

/** POST to one of the plugin's cart endpoints, then reload. */
async function cartAction(action: string, json: Record<string, unknown>) {
  const id = await ensureCart()
  const res = await api(`/carts/${id}/${action}`, {
    method: 'POST',
    json: { ...json, secret: ids().secret },
  })
  await fetchCart()
  return res.ok
}

/** Update the cart's own fields (promo code, gift note, saved items). False when rejected. */
async function patchCart(data: Record<string, unknown>) {
  const { id, secret } = ids()
  if (!id) return false
  const res = await api(`/carts/${id}?depth=0${secretParam(secret)}`, {
    method: 'PATCH',
    json: data,
  })
  await fetchCart()
  return res.ok
}

const idOf = (ref: string | { id: string } | null | undefined) =>
  (isDoc(ref) ? ref.id : ref) ?? null

const savedRefs = (except?: string) =>
  (state.cart?.savedItems ?? [])
    .filter((s) => s.id !== except)
    .map((s) => ({ product: idOf(s.product), variant: idOf(s.variant) }))

/** Why a payment couldn't start, for the checkout to explain. */
export class PaymentError extends Error {
  constructor(readonly reason: 'out-of-stock' | 'unavailable' | 'failed') {
    super(reason)
  }
}

/** Everything that changes the bag. Each returns once the server has answered. */
export const bag = {
  /** Adds to the bag, then opens the drawer with the line marked as just added. */
  add: (productID: string, variantID?: string, quantity = 1) =>
    run(async () => {
      const ok = await cartAction('add-item', {
        item: { product: productID, ...(variantID ? { variant: variantID } : {}) },
        quantity: Math.min(MAX_QUANTITY, quantity),
      })
      const line = state.cart?.items?.find(
        (i) => idOf(i.product) === productID && idOf(i.variant) === (variantID ?? null),
      )
      if (ok && line?.id) {
        const earlier = state.drawer.open ? state.drawer.justAdded : []
        set({
          drawer: { open: true, justAdded: [...earlier.filter((k) => k !== line.id), line.id] },
        })
      }
      return ok
    }),
  openDrawer: () => set({ drawer: { open: true, justAdded: [] } }),
  closeDrawer: () => set({ drawer: closed }),
  setQuantity: (itemID: string, quantity: number) =>
    run(() =>
      quantity < 1
        ? cartAction('remove-item', { itemID })
        : cartAction('update-item', { itemID, quantity: Math.min(MAX_QUANTITY, quantity) }),
    ),
  remove: (itemID: string) => run(() => cartAction('remove-item', { itemID })),
  saveForLater: (itemID: string) =>
    run(async () => {
      const line = state.cart?.items?.find((i) => i.id === itemID)
      if (!line) return false
      await patchCart({
        savedItems: [...savedRefs(), { product: idOf(line.product), variant: idOf(line.variant) }],
      })
      return cartAction('remove-item', { itemID })
    }),
  moveToBag: (savedID: string) =>
    run(async () => {
      const saved = state.cart?.savedItems?.find((s) => s.id === savedID)
      if (!saved) return false
      const variant = idOf(saved.variant)
      await cartAction('add-item', {
        item: { product: idOf(saved.product), ...(variant ? { variant } : {}) },
        quantity: 1,
      })
      return patchCart({ savedItems: savedRefs(savedID) })
    }),
  removeSaved: (savedID: string) => run(() => patchCart({ savedItems: savedRefs(savedID) })),
  applyPromo: (code: string) => run(() => patchCart({ promoCode: code.trim() })),
  removePromo: () => run(() => patchCart({ promoCode: null })),
  setGiftNote: (giftNote: string) => run(() => patchCart({ giftNote })),

  /** Opens a Paystack payment for the bag; resolves with the page to send the shopper to. */
  startPayment: (details: Record<string, unknown>) =>
    run(async () => {
      const { id, secret } = ids()
      if (!id) throw new Error('The bag is empty.')
      const res = await api('/payments/paystack/initiate', {
        method: 'POST',
        json: { ...details, cartID: id, secret, currency: currenciesConfig.defaultCurrency },
      })
      if (!res.ok || !res.body?.authorizationUrl) {
        throw new PaymentError(
          res.body?.cause?.code === 'OutOfStock'
            ? 'out-of-stock'
            : res.body?.cause?.code === 'MissingPrice'
              ? 'unavailable'
              : 'failed',
        )
      }
      return res.body.authorizationUrl as string
    }),

  /** Checks a Paystack payment and creates the order. The bag is cleared once it's paid. */
  confirmPayment: (reference: string, customerEmail: string) =>
    run(async () => {
      const { id, secret } = ids()
      const res = await api('/payments/paystack/confirm-order', {
        method: 'POST',
        json: {
          reference,
          customerEmail,
          cartID: id,
          secret,
          currency: currenciesConfig.defaultCurrency,
        },
      })
      if (!res.ok || !res.body?.orderID) {
        throw new Error(res.body?.message ?? 'Could not confirm the payment.')
      }
      forgetCart()
      return res.body as { orderID: string; total: number; email: string }
    }),
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!started) {
    started = true
    void run(fetchCart)
  }
  // Keep tabs in sync: another tab switched or cleared the cart
  const onStorage = (e: StorageEvent) => {
    if (e.key === ID_KEY) void run(fetchCart)
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/* ---------- Reading ---------- */

export type BagItem = {
  /** The cart line's id */
  key: string
  productID: string
  variantID?: string
  slug: string
  title: string
  image: ImageData
  /** "Afro Kids · Hairress", or "Hairress Collection" for a single collection */
  collectionLine: string
  badge?: string
  size?: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type SavedItem = {
  key: string
  productID: string
  variantID?: string
  slug: string
  title: string
  image: ImageData
  size?: string
  price: number
}

type CartPromo = {
  code: string
  label: string | null
  discount: number
  minimumSubtotal: number | null
}

const priceOf = (doc: Product | Variant | null | undefined) =>
  toNaira((doc as unknown as Record<string, number> | null)?.[priceField])

const sizeOf = (variant: Variant | null) =>
  variant
    ? variant.options
        ?.filter(isDoc)
        .map((o: VariantOption) => o.label)
        .join(' / ') ||
      variant.title ||
      undefined
    : undefined

function collectionLine(product: Product) {
  const names = (product.shopCollections ?? [])
    .filter(isDoc)
    .slice(0, 2)
    .map((c) => c.name)
  return names.length === 1 ? `${names[0]} Collection` : names.join(' · ')
}

function readCart(cart: Cart | null) {
  const items: BagItem[] = (cart?.items ?? []).flatMap((item) => {
    const product = isDoc(item.product) ? item.product : null
    if (!product || !item.id) return []
    const variant = isDoc(item.variant) ? item.variant : null
    const unitPrice = priceOf(variant ?? product)
    return [
      {
        key: item.id,
        productID: product.id,
        variantID: variant?.id,
        slug: product.slug ?? product.id,
        title: product.title,
        image: imageOf(product.image, 'thumbnail'),
        collectionLine: collectionLine(product),
        badge: product.badge ?? undefined,
        size: sizeOf(variant),
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      },
    ]
  })

  const saved: SavedItem[] = (cart?.savedItems ?? []).flatMap((s) => {
    const product = isDoc(s.product) ? s.product : null
    if (!product || !s.id) return []
    const variant = isDoc(s.variant) ? s.variant : null
    return [
      {
        key: s.id,
        productID: product.id,
        variantID: variant?.id,
        slug: product.slug ?? product.id,
        title: product.title,
        image: imageOf(product.image, 'thumbnail'),
        size: sizeOf(variant),
        price: priceOf(variant ?? product),
      },
    ]
  })

  const promo = cart?.promo as CartPromo | null | undefined
  const subtotal = toNaira(cart?.subtotal)
  const discount = toNaira(promo?.discount)

  return {
    items,
    saved,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal,
    promo: promo
      ? { code: promo.code, label: promo.label, minimumSubtotal: toNaira(promo.minimumSubtotal) }
      : null,
    discount,
    total: subtotal - discount,
    giftNote: cart?.giftNote ?? '',
  }
}

/** The bag with prices and totals in naira, plus everything that changes it. */
export function useBag() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState,
  )
  const view = useMemo(() => readCart(snapshot.cart), [snapshot.cart])
  return {
    /** The stored cart has been read — until then, don't show an empty bag */
    ready: snapshot.loaded,
    /** A cart update is in flight */
    isLoading: snapshot.busy,
    drawerOpen: snapshot.drawer.open,
    /** Line keys added since the drawer opened, oldest first */
    justAdded: snapshot.drawer.justAdded,
    ...view,
    ...bag,
  }
}

export type Bag = ReturnType<typeof useBag>
