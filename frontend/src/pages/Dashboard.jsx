import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-stone-light/40 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet" />
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-stone">
              AI Content Studio
            </span>
          </div>
          <button
            onClick={logout}
            className="text-sm font-medium text-stone hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-wide text-violet">
          Dashboard
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-ink">
          Welcome{user?.name ? `, ${user.name}` : ''}.
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone">
          This is the protected area of the studio. Content generation tools
          will live here in a later phase — for now, this page exists to
          prove the login wall works.
        </p>

        <div className="mt-10 rounded-xl border border-stone-light/50 bg-white p-6">
          <p className="font-mono text-xs uppercase tracking-wide text-stone">
            Signed in as
          </p>
          <p className="mt-1 text-[15px] text-ink">{user?.email}</p>
        </div>
      </main>
    </div>
  )
}
