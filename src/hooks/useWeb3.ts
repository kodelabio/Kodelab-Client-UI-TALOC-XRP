import { useContext } from 'react'
import { AppKitProvider } from '@/providers/Web3Provider'

export default () => {
  return useContext(AppKitProvider)!
}
