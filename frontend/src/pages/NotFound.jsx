import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-wide text-violet">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
        This draft doesn't exist.
      </h1>
      <p className="mt-2 text-[15px] text-stone">
        The page you're looking for was never generated.
      </p>
      <Link
        to="/"
        className="mt-6 font-medium text-violet hover:text-violet-dim"
      >
        Back to start
      </Link>
    </div>
  )
}
