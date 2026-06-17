/**
 * Labeled input with inline validation messaging. One job: render a field,
 * its label, and its error — nothing else manages focus or validation logic.
 */
export default function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
  required = true,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-stone-light transition-colors focus:outline-none focus:ring-2 focus:ring-violet/40 ${
          error ? 'border-coral' : 'border-stone-light/60 focus:border-violet'
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-coral">
          {error}
        </p>
      )}
    </div>
  )
}
