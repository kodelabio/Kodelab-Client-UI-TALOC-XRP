import { useRef, useEffect } from 'react'

// https://usehooks.com/usePrevious/
function usePrevious(value: any) {
  const ref = useRef<any>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export default usePrevious
