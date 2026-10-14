'use client'

import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

/* ---------- Content (edit here) ---------- */

const topics = [
  'Order support',
  'Hair consultation',
  'Salon booking',
  'Wholesale & distribution',
  'Formulation School',
  'Other',
]

const defaultTopic = 'Hair consultation'

/** Links elsewhere on the page (e.g. "Choose your route") jump to the form and pick a topic via these hashes. */
const topicHashes: Record<string, string> = {
  '#topic-consultation': 'Hair consultation',
  '#topic-salon': 'Salon booking',
  '#topic-wholesale': 'Wholesale & distribution',
}

/* ---------- Form ---------- */

const labelClass = 'text-[11px] font-semibold tracking-[0.13em] text-[#24260F] uppercase'
const inputClass =
  'w-full border border-[#DDDCD0] bg-white px-4 text-[15px] text-[#24260F] outline-none transition-colors placeholder:text-[#9A9B8A] focus:border-[#24260F]'

/** "Send us a message" card — topic chips, contact fields, optional photos. */
export function ContactForm() {
  const [topic, setTopic] = useState(defaultTopic)
  const [photos, setPhotos] = useState<string[]>([])
  const [sent, setSent] = useState(false)

  // Pick the topic named in the URL hash, then scroll the form into view
  useEffect(() => {
    function onHash() {
      const t = topicHashes[window.location.hash]
      if (!t) return
      setTopic(t)
      setSent(false)
      document.getElementById('message')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    onHash()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: send `new FormData(e.currentTarget)` to the backend (e.g. a Payload form submission)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-4 bg-white p-8 md:p-12" role="status">
        <h2 className="text-xl font-normal tracking-[0.05em] text-[#24260F] uppercase">
          Message received
        </h2>
        <p className="text-[15px] leading-relaxed text-[#6B6C5A]">
          Thank you — one of our hair-care experts will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false)
            setPhotos([])
          }}
          className="text-olive mt-2 text-[11px] font-semibold tracking-[0.14em] uppercase"
        >
          Send another message →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7 bg-white p-6 sm:p-8 md:p-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-normal tracking-[0.05em] text-[#24260F] uppercase md:text-xl">
          Send us a message
        </h2>
        <p className="text-[15px] text-[#6B6C5A]">
          Pick a topic so we can route you to the right person.
        </p>
      </div>

      {/* Topic chips (a radio group, styled as pills) */}
      <fieldset>
        <legend className="sr-only">Topic</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <label
              key={t}
              className={cn(
                'has-focus-visible:ring-olive cursor-pointer rounded-full border px-4 py-2.5 text-sm transition-colors has-focus-visible:ring-2',
                topic === t
                  ? 'border-[#24260F] bg-[#24260F] text-white'
                  : 'border-[#DDDCD0] text-[#24260F] hover:border-[#24260F]',
              )}
            >
              <input
                type="radio"
                name="topic"
                value={t}
                checked={topic === t}
                onChange={() => setTopic(t)}
                className="sr-only"
              />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Full name</span>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className={cn(inputClass, 'h-[52px]')}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(inputClass, 'h-[52px]')}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Phone (optional)</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+234"
            className={cn(inputClass, 'h-[52px]')}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Order no. (optional)</span>
          <input name="order" placeholder="#TQ-" className={cn(inputClass, 'h-[52px]')} />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Message</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us about your hair and scalp — what you’ve tried, and what you’d like to change."
          className={cn(inputClass, 'resize-y py-4 leading-[1.55]')}
        />
      </label>

      {/* Optional photo upload */}
      <label className="has-focus-visible:ring-olive flex cursor-pointer items-center gap-3.5 border border-[#DDDCD0] bg-[#F6F5EF] p-4 transition-colors hover:border-[#24260F] has-focus-visible:ring-2">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-olive size-5 shrink-0"
        >
          <path d="M16 5h6" />
          <path d="M19 2v6" />
          <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
          <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
          <circle cx="9" cy="9" r="2" />
        </svg>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[15px] font-medium text-[#24260F]">
            {photos.length
              ? `${photos.length} photo${photos.length > 1 ? 's' : ''} added`
              : 'Add photos of your scalp or hair'}
          </span>
          <span className="truncate text-[13px] text-[#6B6C5A]">
            {photos.length
              ? photos.join(', ')
              : 'Optional — helps our experts recommend the right routine'}
          </span>
        </span>
        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos(Array.from(e.target.files ?? [], (f) => f.name))}
          className="sr-only"
        />
      </label>

      <button
        type="submit"
        className="group hover:bg-olive flex items-center justify-between bg-[#24260F] px-6 py-[18px] text-[13px] font-semibold tracking-[0.11em] text-white uppercase transition-colors"
      >
        Send message
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[18px] transition-transform duration-300 group-hover:translate-x-1"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </form>
  )
}
