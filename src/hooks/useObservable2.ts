import useMaker from './useMaker'
import { useEffect, useState } from 'react'

const useObservable = (key: string, ...args: any[]) => {
  const { maker } = useMaker()
  const multicall = maker?.service('multicall')
  const [value, setValue] = useState<any>()

  useEffect(() => {
    if (!maker || !multicall.watcher) return
    if (args.findIndex((arg) => typeof arg === 'undefined') !== -1) return
    const sub = multicall.watch(key, ...args).subscribe?.({
      next: (val: any) => {
        setValue(val)
      },
      error: () => {
        setValue(undefined)
      },
    })

    return () => {
      sub.unsubscribe()
      setValue(undefined)
    }
    // eslint-disable-next-line
  }, [
    maker,
    multicall?.watcher,
    key,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)),
  ])

  return value
}

export const watch: Record<string, any> = {}

export default useObservable
