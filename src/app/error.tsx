'use client' // Error boundaries must be Client Components

import {useEffect} from 'react'
import {Frown} from 'lucide-react'
import {Button} from '@/components/ui/button'

export default function Error({
  error,
  reset
}: {
  error: Error & {digest?: string}
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <main className="flex h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-purple-500 to-purple-700 px-6 text-center text-white">
      <div className="mb-6">
        <Frown
          className="h-32 w-32 transition-transform hover:scale-105 active:scale-90"
          strokeWidth={1.25}
        />
      </div>

      <h1 className="font-display mb-4 text-4xl">Something went wrong</h1>

      <p className="mb-8 max-w-md text-sm opacity-90">
        An unexpected error occurred while loading this page. Check back later, or try again.
      </p>

      <Button
        variant="ghost"
        onClick={() => reset()}
        className="rounded-md border border-white/30 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
      >
        Try again
      </Button>
    </main>
  )
}
