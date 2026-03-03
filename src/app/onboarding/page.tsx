'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const QUESTIONS = [
  {
    id: 'role',
    label: 'What best describes your current role?',
    placeholder: 'e.g., ML Engineer, Product Manager, Researcher',
  },
  {
    id: 'goals',
    label: 'What are your primary goals?',
    placeholder: 'e.g., Networking, Learning, Career growth',
  },
  {
    id: 'papersFrequency',
    label: 'Do you read research papers regularly?',
    placeholder: 'Yes, Sometimes, Rarely, or No',
  },
  {
    id: 'eventImportance',
    label: 'How important is event networking to you?',
    placeholder: 'Very, Somewhat, or Not much',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Onboarding failed')
      }
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium">Welcome to Orbit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A few questions to personalize your experience
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-2">
              <Label htmlFor={q.id}>{q.label}</Label>
              <Input
                id={q.id}
                placeholder={q.placeholder}
                value={answers[q.id] ?? ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            </div>
          ))}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Setting up...' : 'Continue'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          You can skip this and customize features later in Settings.
        </p>
      </div>
    </div>
  )
}
