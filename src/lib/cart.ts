'use client'

import { useMemo, useSyncExternalStore } from 'react'

import { currenciesConfig, priceField } from '@/lib/currencies'
import { imageOf, isDoc } from '@/lib/media'
import { toNaira } from '@/lib/pricing'
import type { Cart, Product, Variant, VariantOption } from '@/payload-types'
import type { ImageData } from '@/types/product'

/*
 * The bag, stored in Payload's carts collection and changed through the ecommerce plugin's
 * cart endpoints. A guest's cart id and secret are kept in localStorage; prices and the promo
 * discount come from the server.
 *
 * Changes show instantly: an added item, a new quantity or a removal is drawn straight away and the
 * server catches up in the background; if it refuses, the change is undone.
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
  /** Adds shown in the bag before the server has saved them */
  pending: PendingAdd[]
  /** Quantities shown before the server has saved them, by line key (0 = removed) */
  overrides: Record<string, number>
}

/** What the bag shows for an item it hasn't heard back about yet */
export type AddPreview = {
  title: string
  slug: string
  image: ImageData
  /** Unit price in naira */
  price: number
  size?: string
}

type PendingAdd = {
  key: string
  productID: string
  variantID?: string
  quantity: number
  preview?: AddPreview
}

const closed = { open: false, justAdded: [] }
const empty: State = {
  loaded: false,
  busy: false,
  cart: null,
  drawer: closed,
  pending: [],
  overrides: {},
}
let state: State = empty
const serverState: State = empty
let pendingCount = 0
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

const lineFor = (productID: string, variantID?: string) =>
  state.cart?.items?.find(
    (i) => idOf(i.product) === productID && idOf(i.variant) === (variantID ?? null),
  )

/** Shows a line's new quantity at once, then saves it; the bag's own copy takes over after. */
function withOverride(itemID: string, quantity: number, save: () => Promise<boolean>) {
  set({ overrides: { ...state.overrides, [itemID]: quantity } })
  return run(async () => {
    try {
      return await save()
    } catch {
      return false
    } finally {
      const { [itemID]: _done, ...rest } = state.overrides
      set({ overrides: rest })
    }
  })
}

/** The details a card or product page already has, for drawing an added item at once. */
export const previewOf = (
  product: { title: string; slug: string; image: ImageData; price: number },
  size?: { label: string; price: number },
): AddPreview => ({
  title: product.title,
  slug: product.slug,
  image: product.image,
  price: size?.price ?? product.price,
  size: size?.label,
})

/** Everything that changes the bag. Changes show at once; each returns once the server has answered. */
export const bag = {
  /**
   * Adds to the bag and opens the drawer with the line marked as just added — straight away,
   * using `preview` to draw a line the bag doesn't have yet, while the server saves it.
   */
  add: (productID: string, variantID?: string, quantity = 1, preview?: AddPreview) => {
    const existing = lineFor(productID, variantID)
    const key = existing?.id ?? `pending-${++pendingCount}`
    const add: PendingAdd = { key, productID, variantID, quantity, preview }
    const earlier = state.drawer.open ? state.drawer.justAdded : []
    set({
      pending: [...state.pending, add],
      drawer: { open: true, justAdded: [...earlier.filter((k) => k !== key), key] },
    })

    return run(async () => {
      const ok = await cartAction('add-item', {
        item: { product: productID, ...(variantID ? { variant: variantID } : {}) },
        quantity: Math.min(MAX_QUANTITY, quantity),
      }).catch(() => false)
      // Swap the stand-in for the saved line (or drop it if the server said no)
      const saved = lineFor(productID, variantID)?.id
      set({
        pending: state.pending.filter((p) => p !== add),
        drawer: {
          ...state.drawer,
          justAdded: state.drawer.justAdded.flatMap((k) =>
            k !== key ? [k] : ok && saved ? [saved] : [],
          ),
        },
      })
      return ok
    })
  },
  openDrawer: () => set({ drawer: { open: true, justAdded: [] } }),
  closeDrawer: () => set({ drawer: closed }),
  setQuantity: (itemID: string, quantity: number) => {
    const next = Math.max(0, Math.min(MAX_QUANTITY, quantity))
    return withOverride(itemID, next, () =>
      next < 1
        ? cartAction('remove-item', { itemID })
        : cartAction('update-item', { itemID, quantity: next }),
    )
  },
  remove: (itemID: string) => withOverride(itemID, 0, () => cartAction('remove-item', { itemID })),
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
  /** Shown before the server has saved it — its controls wait until it has */
  pending?: boolean
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

function readCart(
  cart: Cart | null,
  pending: PendingAdd[] = [],
  overrides: Record<string, number> = {},
) {
  const stored: BagItem[] = (cart?.items ?? []).flatMap((item) => {
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

  // Layer on what hasn't been saved yet: new quantities and removals, then adds
  let items = stored.flatMap((item) => {
    const quantity = overrides[item.key] ?? item.quantity
    return quantity > 0 ? [{ ...item, quantity, lineTotal: item.unitPrice * quantity }] : []
  })
  for (const add of pending) {
    const match = items.find((i) => i.productID === add.productID && i.variantID === add.variantID)
    if (match) {
      const quantity = Math.min(MAX_QUANTITY, match.quantity + add.quantity)
      items = items.map((i) =>
        i === match ? { ...i, quantity, lineTotal: i.unitPrice * quantity } : i,
      )
    } else if (add.preview) {
      items.push({
        key: add.key,
        productID: add.productID,
        variantID: add.variantID,
        slug: add.preview.slug,
        title: add.preview.title,
        image: add.preview.image,
        collectionLine: '',
        size: add.preview.size,
        quantity: add.quantity,
        unitPrice: add.preview.price,
        lineTotal: add.preview.price * add.quantity,
        pending: true,
      })
    }
  }

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
  // Worked out from the lines shown, so it moves with them; it matches the server's once saved
  const subtotal = items.reduce((n, i) => n + i.lineTotal, 0)
  const serverSubtotal = toNaira(cart?.subtotal)
  const serverDiscount = toNaira(promo?.discount)
  // A percentage code scales with the bag until the server's figure comes back
  const discount =
    serverSubtotal > 0 && subtotal !== serverSubtotal
      ? Math.min(subtotal, Math.round((serverDiscount * subtotal) / serverSubtotal))
      : serverDiscount

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
  const view = useMemo(
    () => readCart(snapshot.cart, snapshot.pending, snapshot.overrides),
    [snapshot.cart, snapshot.pending, snapshot.overrides],
  )
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
