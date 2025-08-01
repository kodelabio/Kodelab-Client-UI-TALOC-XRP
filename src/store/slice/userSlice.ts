import { User } from '@/types'
import { createSlice } from '@reduxjs/toolkit'
import Web3 from 'web3'

interface State {
  user: Partial<User>
  web3: Web3 | null
  walletAddress: string
}
const initialState: State = {
  user: {},
  web3: null,
  walletAddress: '',
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setGlobalWeb3(state, { payload }: { payload: { web3: Web3 | null; walletAddress: string } }) {
      state.web3 = payload.web3
      state.walletAddress = payload.walletAddress
    },
  },
})
export const { setGlobalWeb3 } = userSlice.actions

export default userSlice.reducer
