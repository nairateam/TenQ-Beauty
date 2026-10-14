/*
 * Seed content: full article bodies, keyed by article slug. Only src/seed/index.ts reads this.
 * The seed only writes a body to an article that has none yet, so edits made in the admin stay.
 */

/** Plain paragraphs as a Lexical rich-text value. */
export function rich(...paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [
          { type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 },
        ],
      })),
    },
  }
}

type StepSeed = {
  blockType: 'step'
  title: string
  tocLabel?: string
  content: ReturnType<typeof rich>
  products?: { slug: string; note?: string }[]
  showRecommendation?: boolean
}

type BlockSeed =
  | { blockType: 'text'; content: ReturnType<typeof rich> }
  | StepSeed
  | { blockType: 'quote'; text: string }
  | { blockType: 'callout'; eyebrow: string; text: string; icon: 'calendar'; tocLabel?: string }
  | { blockType: 'advice'; eyebrow: string; text: string; tocLabel?: string }

export type ArticleBodySeed = {
  standfirst: string
  coverCaption: string
  tags: string[]
  body: BlockSeed[]
}

export const articleBodies: Record<string, ArticleBodySeed> = {
  'how-to-wash-your-hair-the-right-way': {
    standfirst:
      'Less frizz, less damage and less hair loss — the right wash-day technique, step by step.',
    coverCaption: 'Wash day, done gently — technique matters as much as the products you use.',
    tags: ['Wash day', 'Scalp care', 'Natural hair', 'Detangling'],
    body: [
      {
        blockType: 'text',
        content: rich(
          'Washing your hair might seem as simple as lathering up, rinsing and conditioning. But washing it the right way comes with real benefits — less frizz, less damage and less hair loss.',
          'Here are the steps to wash your hair without causing damage.',
        ),
      },
      {
        blockType: 'step',
        title: 'Start with detangling',
        tocLabel: 'Detangle first',
        content: rich(
          'If you’re new to natural hair care, start wash day by detangling with a conditioner that has lots of slip. Removing every tangle and knot first makes it easier to get shampoo and conditioner to every strand — with zero breakage. Start from the ends and gently work up to the roots: less breakage, less pulling.',
        ),
      },
      {
        blockType: 'step',
        title: 'Get the water temperature right',
        tocLabel: 'Get the water right',
        content: rich(
          'Water that’s too hot risks damaging your hair and scalp, so stick with lukewarm. Warm water opens the cuticle and helps rinse out dirt and build-up. Wet your hair thoroughly before you apply shampoo.',
        ),
      },
      {
        blockType: 'step',
        title: 'Shampoo the roots — gently',
        tocLabel: 'Shampoo the roots',
        content: rich(
          'Focus shampoo on your roots first and scrub gently with the pads of your fingers, not your nails. Nails can leave tiny injuries that make your scalp sore after washing.',
          'Choosing the right shampoo is key. A rich, moisturising shampoo can be too much for oily hair, while a clarifying one can leave dry hair feeling stripped. Pick one that cleanses your roots and keeps your hair hydrated.',
        ),
        products: [
          {
            slug: 'relief-scalp-detox-shampoo',
            note: 'Deep-cleans and gently exfoliates; removes build-up and helps prevent dandruff.',
          },
          {
            slug: 'african-bubbles-shampoo',
            note: 'Removes build-up and helps prevent scalp infection — naturally.',
          },
        ],
        showRecommendation: true,
      },
      {
        blockType: 'quote',
        text: 'Treat yourself to at least 60 seconds of scalp massage — it promotes blood flow to the follicles, encouraging hair to grow healthier.',
      },
      {
        blockType: 'step',
        title: 'Rinse thoroughly',
        content: rich(
          'If you don’t rinse properly, your hair ends up flat, lifeless and coated. Rinse with warm water until every trace of shampoo is gone. Take your time — rushing leaves product behind that weighs hair down.',
        ),
      },
      {
        blockType: 'step',
        title: 'Condition your hair, not your scalp',
        tocLabel: 'Condition hair, not scalp',
        content: rich(
          'Apply conditioner to your hair only and leave it on for at least 15 minutes to detangle, nourish and moisturise your ends. A wide-tooth comb spreads it evenly — but be gentle: hair breaks more easily when wet.',
          'Looking to repair without weighing hair down? Our lightweight Keratin Repair Conditioner restores hair after bleaching, colouring, chemical treatments or excessive heat — leave it on for about 30 minutes.',
        ),
        products: [{ slug: 'keratin-repair-conditioner' }],
      },
      {
        blockType: 'step',
        title: 'Rinse again — with cold water',
        tocLabel: 'Rinse again — cold',
        content: rich(
          'To avoid dull hair, rinse your conditioner out well. Finishing with cold water means less frizz and more shine.',
        ),
      },
      {
        blockType: 'step',
        title: 'Dry gently',
        content: rich(
          'Use a microfibre hair wrap or towel: it dries faster and won’t tug or break hair while it’s wet — when it’s at its most fragile. Follow with leave-in conditioner and hair butter for softer hair. If you plan to heat-style, make sure your hair is completely dry and use a heat protectant.',
        ),
        products: [{ slug: 'silky-leave-in-conditioner' }, { slug: 'hydrating-hair-butter' }],
      },
      {
        blockType: 'step',
        title: 'Nourish your scalp',
        content: rich(
          'Finish with our thickening hair & edges oil and/or scalp serum, for a tingling, sweet sensation.',
        ),
        products: [{ slug: 'dazzle-hair-edges-growth-oil' }, { slug: 'bloom-peptide-scalp-serum' }],
      },
      {
        blockType: 'step',
        title: 'Stretch before styling',
        content: rich(
          'Put kinky hair in twists, big braids, Bantu knots or threads to stretch it before styling.',
        ),
      },
      {
        blockType: 'callout',
        eyebrow: 'When should your next wash be?',
        text: 'Every 1–3 weeks — not more than once a week, and not less than once every three weeks.',
        icon: 'calendar',
        tocLabel: 'When to wash next',
      },
      {
        blockType: 'advice',
        eyebrow: 'Pro advice',
        text: 'It’s not just the products you use — your technique matters too. Hair is more fragile than we think, especially when we style it daily and layer multiple products. Being gentle on wash day helps your hair grow fuller, longer and smoother.',
        tocLabel: 'Pro advice',
      },
    ],
  },
}

export const journalAuthor = {
  authorName: 'The Ten-Q Journal',
  authorByline: 'the Ten-Q Journal team',
  authorInitials: 'TQ',
  authorBio:
    'Written by our team of formulators and scalp & hair health experts, led by founder and UK-trained cosmetic formulator Ladejobi Oluwabukola.',
  routineTitle: 'Shop this routine',
  routineNote: 'Everything mentioned in this article.',
}
