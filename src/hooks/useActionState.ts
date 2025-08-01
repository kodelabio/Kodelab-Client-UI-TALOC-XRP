import { useState, useCallback } from 'react'

export default function useActionState(action: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [success, setSuccess] = useState(false)
  const onAction = useCallback(async () => {
    setError(null)
    setSuccess(false)
    setIsLoading(true)
    try {
      const res = await action()
      setIsLoading(false)
      setSuccess(true)
      setError(null)
      return res
    } catch (err) {
      setIsLoading(false)
      setError(err)
    }
  }, [action, setIsLoading, setError])

  const reset = () => {
    setError(null)
    setSuccess(false)
  }
  return [onAction, isLoading, success, error, reset]
}
