import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { signIn, signUp, signInWithGoogle, signInWithMagicLink } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [useMagicLink, setUseMagicLink] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setIsSignUp(false)
      setEmail('')
      setPassword('')
      setError(null)
      setIsLoading(false)
      setSignUpSuccess(false)
      setMagicLinkSent(false)
      setUseMagicLink(false)
    }
  }, [open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password)
        if (signUpError) {
          setError(signUpError.message)
        } else {
          setSignUpSuccess(true)
        }
      } else {
        const { error: signInError } = await signIn(email, password)
        if (signInError) {
          setError(signInError.message)
        } else {
          onOpenChange(false)
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    const { error: oauthError } = await signInWithGoogle()
    if (oauthError) {
      setError(oauthError.message)
    }
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const { error: otpError } = await signInWithMagicLink(email)
      if (otpError) {
        setError(otpError.message)
      } else {
        setMagicLinkSent(true)
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function renderContent() {
    if (magicLinkSent) {
      return (
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a magic link to <strong>{email}</strong>. Click it to sign
              in — no password needed.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button
              variant="ghost"
              onClick={() => {
                setMagicLinkSent(false)
                setUseMagicLink(false)
              }}
            >
              Back to sign in
            </Button>
          </CardFooter>
        </Card>
      )
    }

    if (signUpSuccess) {
      return (
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to <strong>{email}</strong>. Click it
              to activate your account.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button
              variant="ghost"
              onClick={() => {
                setSignUpSuccess(false)
                setIsSignUp(false)
              }}
            >
              Back to sign in
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Sign up to start planning your trips'
              : 'Sign in to TrailForge'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {useMagicLink ? (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-modal-email">Email</Label>
                <Input
                  id="login-modal-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending link…' : 'Send magic link'}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => {
                  setUseMagicLink(false)
                  setError(null)
                }}
              >
                Use password instead
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-modal-email">Email</Label>
                  <Input
                    id="login-modal-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-modal-password">Password</Label>
                  <Input
                    id="login-modal-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? isSignUp
                      ? 'Creating account…'
                      : 'Signing in…'
                    : isSignUp
                      ? 'Create account'
                      : 'Sign in'}
                </Button>

                {!isSignUp && (
                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={() => {
                      setUseMagicLink(true)
                      setError(null)
                    }}
                  >
                    Sign in with magic link instead
                  </Button>
                )}
              </form>
            </>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <Button
            variant="link"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            disabled={isLoading}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <img
          src="/logo-w-text.png"
          alt="TrailForge"
          className="mx-auto h-48 w-auto"
        />
        <DialogHeader className="sr-only">
          <DialogTitle>Sign in to TrailForge</DialogTitle>
          <DialogDescription>
            Sign in or create an account to manage your trips.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground" onClick={() => onOpenChange(false)}>Privacy Policy</Link>
        </p>
      </DialogContent>
    </Dialog>
  )
}
