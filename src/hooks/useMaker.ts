import { MakerObjectContext } from '../providers/MakerProvider'
import { useContext } from 'react'

function useMaker() {
  return useContext(MakerObjectContext)!
}

export default useMaker
