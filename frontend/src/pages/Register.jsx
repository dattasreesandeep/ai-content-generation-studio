import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormField from '../components/FormField'
import Button from '../components/Button'
import BrandPanel from '../components/BrandPanel'
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
} from '../utils/validators'

export default function Register() {
  const { register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (error) clearError()
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const errors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    }
    const hasErrors = Object.values(errors).some(Boolean)
    setFieldErrors(errors)
    if (hasErrors) return

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    if (result.success) {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet" />
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-stone">
                AI Content Studio
              </span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-medium tracking-tight text-ink">
            Create your account
          </h1>
          <p className="mt-2 text-[15px] text-stone">
            Start drafting in minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-coral/30 bg-coral-light px-3.5 py-2.5 text-sm text-coral"
              >
                {error}
              </div>
            )}

            <FormField
              id="name"
              label="Full name"
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={form.name}
              onChange={handleChange}
              error={fieldErrors.name}
            />

            <FormField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@studio.com"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />

            <FormField
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              error={fieldErrors.password}
            />

            <FormField
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
            />

            <Button isLoading={isLoading}>Create account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-stone">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-violet hover:text-violet-dim">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
