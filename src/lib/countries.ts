/**
 * Countries the store can deliver to, and Nigeria's states. Reference data shared by the
 * Payload config (addresses, shipping methods) and the checkout form, so it stays client-safe.
 * Where the store actually delivers, and at what price, is set per shipping method in Payload.
 */

export type Country = { label: string; value: string }

export const countries: Country[] = [
  { label: 'Nigeria', value: 'NG' },
  { label: 'Ghana', value: 'GH' },
  { label: 'Kenya', value: 'KE' },
  { label: 'South Africa', value: 'ZA' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Ireland', value: 'IE' },
  { label: 'United States', value: 'US' },
  { label: 'Canada', value: 'CA' },
  { label: 'France', value: 'FR' },
  { label: 'Germany', value: 'DE' },
  { label: 'Italy', value: 'IT' },
  { label: 'Netherlands', value: 'NL' },
  { label: 'Spain', value: 'ES' },
  { label: 'United Arab Emirates', value: 'AE' },
  { label: 'Australia', value: 'AU' },
]

export const countryName = (code?: string | null) =>
  countries.find((c) => c.value === code)?.label ?? code ?? ''

export const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe',
  'Zamfara',
]
