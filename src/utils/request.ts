import { ASSETS_URL } from '@/constants'
import axios from 'axios'

export interface ResponseType<T = any> {
  errcode: number
  data: T
  errmsg?: string
  count?: number
}

export const request = axios.create({
  baseURL: ASSETS_URL,
})

request.interceptors.response.use((res) => {
  const { data } = res
  if (data.errcode !== 0) {
    throw data
  } else {
    return res
  }
})
