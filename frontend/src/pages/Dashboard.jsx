import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { generateBlog } from '../api/generate'

export default function Dashboard() {
  const { user, token, logout } = useAuth()

  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState('professional')
  const [wordCount, setWordCount] = useState(800)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await generateBlog(
        {
          topic,
          audience,
          tone,
          word_count: Number(wordCount),
        },
        token
      )

      setResult(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome {user?.name}</h1>
          <p>{user?.email}</p>
        </div>

        <button onClick={logout}>
          Sign Out
        </button>
      </div>

      <div className="space-y-4 max-w-3xl">
        <input
          type="text"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="text"
          placeholder="Audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="border p-2 w-full"
        />

        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="technical">Technical</option>
        </select>

        <input
          type="number"
          value={wordCount}
          onChange={(e) => setWordCount(e.target.value)}
          className="border p-2 w-full"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="border px-4 py-2"
        >
          {loading ? 'Generating...' : 'Generate Blog'}
        </button>

        {error && (
          <div className="text-red-600">{error}</div>
        )}

        {result && (
          <div className="border p-4 mt-6">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
