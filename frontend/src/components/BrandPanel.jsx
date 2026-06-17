const FRAGMENTS = [
  { label: 'Blog draft', text: '"Five ways climate tech is reshaping logistics in 2026..."' },
  { label: 'Product copy', text: '"Built for teams who ship daily, not quarterly."' },
  { label: 'Email subject', text: '"Your draft is ready for review."' },
  { label: 'Ad variant', text: '"Stop guessing. Start generating."' },
  { label: 'Social caption', text: '"Three drafts. One winner. Zero writer\'s block."' },
]

/**
 * The left-hand brand panel shown on both auth screens. Its signature
 * element is a vertical stack of content fragments that fade in and out on
 * a staggered loop — a quiet nod to a studio where drafts are always being
 * generated in the background.
 */
export default function BrandPanel() {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-ink px-12 py-12 text-paper lg:flex">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(107,92,255,0.18),transparent_55%)]" />

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet" />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-stone-light">
            AI Content Studio
          </span>
        </div>
      </div>

      <div className="relative z-10 max-w-md">
        <h2 className="font-display text-4xl font-medium leading-[1.15] tracking-tight">
          Every draft starts somewhere.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-stone-light">
          Sign in to pick up your drafts, prompts, and generated assets right
          where you left them.
        </p>
      </div>

      <div className="relative z-10 h-32">
        <div className="font-mono text-xs uppercase tracking-wide text-stone-light/70">
          Currently generating
        </div>
        <div className="relative mt-3 h-20">
          {FRAGMENTS.map((fragment, index) => (
            <div
              key={fragment.label}
              className="absolute inset-0 animate-cycle-fade opacity-0"
              style={{ animationDelay: `${index * 1.2}s` }}
            >
              <span className="font-mono text-[11px] uppercase tracking-wide text-violet">
                {fragment.label}
              </span>
              <p className="mt-1.5 font-display text-lg italic text-paper/90">
                {fragment.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
