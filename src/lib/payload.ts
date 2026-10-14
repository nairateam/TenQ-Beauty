import 'server-only'

import config from '@payload-config'
import { getPayload as getPayloadInstance } from 'payload'

/**
 * Payload Local API for Server Components and server actions.
 * Usage: const payload = await getPayload(); await payload.find({ collection: 'posts' })
 */
export const getPayload = () => getPayloadInstance({ config })
