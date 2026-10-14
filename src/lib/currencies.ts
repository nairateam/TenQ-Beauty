/**
 * Currencies shared by the Payload config (server) and EcommerceProvider (client).
 * Defined by hand so this file can be imported on the client without pulling in
 * server code from '@payloadcms/plugin-ecommerce'.
 *
 * Prices are stored in the smallest unit (kobo); the storefront shows whole naira.
 */
export const NGN = {
  code: 'NGN',
  decimals: 2,
  label: 'Nigerian Naira',
  symbol: '₦',
}

export const currenciesConfig = {
  supportedCurrencies: [NGN],
  defaultCurrency: 'NGN',
}

/** Field holding a product or variant's price in the default currency, e.g. "priceInNGN". */
export const priceField = `priceIn${currenciesConfig.defaultCurrency}` as const
