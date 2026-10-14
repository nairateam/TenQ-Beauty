import Link from 'next/link'

import { Container } from '@/components/ui'

export default function NotFound() {
  return (
    <Container className="py-24">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <Link href="/" className="mt-6 inline-block underline">
        Back to home
      </Link>
    </Container>
  )
}
