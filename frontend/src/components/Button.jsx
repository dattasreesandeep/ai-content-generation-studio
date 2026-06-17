/**
 * Primary call-to-action button. Shows a spinner glyph and disables itself
 * while isLoading, so a slow network can't produce duplicate submissions.
 */
export default function Button({ children, type = 'submit', isLoading = false, disabled = false, ...rest }) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-[15px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
      {...rest}
    >
      {isLoading && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper/40 border-t-paper"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
