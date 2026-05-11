'use client'

// Client component — uses useEffect, Redux hooks, router, and React Hook Form

import { useEffect, useState }              from 'react'
import { useRouter }                        from 'next/navigation'
import { useAppDispatch, useAppSelector }   from '@/store/hooks'
import {
  loginUser,
  selectIsAuthenticated,
  selectLoginError,
  selectAuthIsLoading,
} from '@/store/slices/authSlice'
import { useZodForm }                       from '@/lib/hooks/useZodForm'
import { loginSchema, LoginFormValues }     from '@/types/schemas'
import { Button }                           from '@/components/ui/Button'
import { Input }                            from '@/components/ui/Input'
import { TopBar }                           from '@/components/layout/TopBar'
import { Mail, Lock, Eye, EyeOff, LogIn }  from '@/lib/icons'

const DEMO_CREDENTIALS = [
  ['OPERATOR',   'operator@ops.com',   'ops1234'],
  ['SUPERVISOR', 'supervisor@ops.com', 'sup1234'],
  ['ENGINEER',   'engineer@ops.com',   'eng1234'],
  ['ADMIN',      'admin@ops.com',      'adm1234'],
] as const

export default function LoginPage() {
  const dispatch        = useAppDispatch()
  const router          = useRouter()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const loginError      = useAppSelector(selectLoginError)
  const isLoading       = useAppSelector(selectAuthIsLoading)

  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue } =
    useZodForm(loginSchema, {
      defaultValues: { email: '', password: '' },
    })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) router.push('/overview')
  }, [isAuthenticated, router])

  const onSubmit = (data: LoginFormValues) => {
    dispatch(loginUser(data.email, data.password))
  }

  // Quick-fill from demo credentials row
  const fillCredentials = (email: string, password: string) => {
    setValue('email',    email,    { shouldValidate: false })
    setValue('password', password, { shouldValidate: false })
  }

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-scada-bg flex items-center justify-center px-4 relative">
        {/* Card */}
        <div className="w-full max-w-sm bg-scada-surface border border-scada-border rounded-scada p-8">

          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="text-accent-primary"
            >
              <polygon
                points="16,2 28,9 28,23 16,30 4,23 4,9"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="16" cy="16" r="4" fill="currentColor" />
              <line x1="16" y1="6"  x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" />
              <line x1="16" y1="20" x2="16" y2="26" stroke="currentColor" strokeWidth="1.5" />
              <line x1="7"  y1="11" x2="12" y2="14" stroke="currentColor" strokeWidth="1.5" />
              <line x1="20" y1="18" x2="25" y2="21" stroke="currentColor" strokeWidth="1.5" />
              <line x1="25" y1="11" x2="20" y2="14" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="18" x2="7"  y2="21" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-text-value text-lg font-mono tracking-widest uppercase">
              Industrial Ops UI
            </span>
            <span className="text-text-muted text-xs font-mono">
              Supervision Platform
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-scada-border my-6" />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="text"
              placeholder="your@email.com"
              register={register('email')}
              error={errors.email?.message}
              icon={<Mail size={14} className="text-text-muted" />}
            />
            <Input
              label="Password"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              register={register('password')}
              error={errors.password?.message}
              icon={<Lock size={14} className="text-text-muted" />}
              rightIcon={
                <button type="button" onClick={() => setShowPwd(!showPwd)} aria-label={showPwd ? 'Hide password' : 'Show password'}>
                  {showPwd
                    ? <EyeOff size={14} className="text-text-muted" />
                    : <Eye    size={14} className="text-text-muted" />}
                </button>
              }
            />

            {/* Redux-level error (wrong credentials) */}
            {loginError && (
              <div className="bg-status-alarm/10 border border-status-alarm/30 text-status-alarm text-xs font-mono px-3 py-2 rounded-scada">
                {loginError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              loading={isLoading}
              icon={<LogIn size={16} />}
            >
              LOGIN
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="border-t border-scada-border mt-6 pt-4 space-y-1">
            {DEMO_CREDENTIALS.map(([role, mail, pwd]) => (
              <div
                key={role}
                className="flex justify-between text-xs font-mono text-text-muted hover:text-text-primary cursor-pointer px-1 py-0.5"
                onClick={() => fillCredentials(mail, pwd)}
              >
                <span className="text-accent-gold">{role}</span>
                <span>{mail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Version */}
        <p className="absolute bottom-4 text-text-muted text-xs font-mono text-center w-full">
          INDUSTRIAL OPS UI · v0.1.0 · © 2026
        </p>
      </main>
    </>
  )
}
