import { useCallback, useEffect, useState } from 'react'
import { abiAddresses } from '@/constants'
import { fromWei } from '@/utils'
import { useToggle } from 'ahooks'
import BigNumber from 'bignumber.js'
import uniqBy from 'lodash/uniqBy'
import Web3 from 'web3'
import type { Log } from 'web3-core'
import ethAbi from 'web3-eth-abi'
import useWeb3 from '@/hooks/useWeb3'

export interface EventInfo {
  amount?: string
  dai?: string
  gov?: string
  block: number
  txHash: string
  type: string
  timestamp: number
}

export interface ActiveEventInfo extends EventInfo {
  dai?: string
  gov?: string
}

function funcSigTopic(v: string) {
  return ethAbi.encodeFunctionSignature(v).padEnd(66, '0')
}

function eventSigTopic(v: string) {
  return ethAbi.encodeEventSignature(v).padEnd(66, '0')
}

function parseWeiNumeric(value: string) {
  return fromWei(new BigNumber(value).toString(16))
}

// const EVENT_POT_JOIN = funcSigTopic('enterStaking(uint256)')
// const EVENT_POT_EXIT = funcSigTopic('leaveStaking(uint256)')
const EVENT_REWARD = eventSigTopic('Reward(address,uint256,uint256)')

const EVENT_POT_JOIN = eventSigTopic('EnterStaking(address,uint256,uint256,uint256)')
const EVENT_POT_EXIT = eventSigTopic('LeaveStaking(address,uint256,uint256,uint256)')
const EVENT_POT_HARVEST = eventSigTopic('Harvest(address,uint256,uint256)')

function parseData(data: Log[]) {
  const paramsType = [
    { type: 'uint256', name: 'amount' },
    { type: 'uint256', name: 'dai' },
    { type: 'uint256', name: 'gov' },
  ]
  const arr: EventInfo[] = []
  for (const item of data) {
    let type = ''
    let data: { amount?: string; dai?: string; gov?: string } = {}
    const name = item.topics[0]
    if (name === EVENT_POT_JOIN) {
      type = 'DSR_DEPOSIT'
      data = decodeParameters(paramsType, item.data)
    } else if (name === EVENT_POT_EXIT) {
      type = 'DSR_WITHDRAW'
      data = decodeParameters(paramsType, item.data)
    } else if (name === EVENT_POT_HARVEST) {
      type = 'DSR_HARVEST'
      data = decodeParameters([paramsType[1], paramsType[2]], item.data)
    }
    arr.push({
      txHash: item.transactionHash,
      timestamp: 0,
      block: item.blockNumber,
      type,
      amount: fromWei(data.amount || '0'),
      dai: fromWei(data.dai || '0'),
      gov: fromWei(data.gov || '0'),
    })
  }
  return arr
}

function decodeParameters(type: any[], hex: string) {
  return ethAbi.decodeParameters(type, hex)
}

export async function getTransactionDetail(web3: Web3, txHash: string) {
  const { eth } = web3
  const res = await eth.getTransactionReceipt(txHash)
  const rewardInfo = res.logs.find((item) => item.topics[0] === EVENT_REWARD)
  let dai = ''
  let gov = ''
  if (rewardInfo) {
    const info = eth.abi.decodeParameters(
      [
        { type: 'uint256', name: 'dai' },
        { type: 'uint256', name: 'gov' },
      ],
      rewardInfo.data,
    )
    dai = fromWei(info.dai)
    gov = fromWei(info.gov)
  }
  return {
    dai,
    gov,
  }
}

let cacheList: EventInfo[]
let promisesBlockTimestamp: PlainObject<number> = {}
export default function useDsrEventHistory() {
  const { web3, walletAddress } = useWeb3()
  const [allList, setAllList] = useState<EventInfo[]>([])
  const [list, setList] = useState<EventInfo[]>([])
  const [loading, { toggle }] = useToggle()

  const fetchHistoryList = useCallback(
    async (refresh?: boolean) => {
      if (!web3) return
      if (cacheList && !refresh) {
        setAllList(cacheList)
      } else {
        const data = await web3.eth.getPastLogs({
          address: abiAddresses.DssSavingReward,
          topics: [
            [EVENT_POT_JOIN, EVENT_POT_EXIT, EVENT_POT_HARVEST],
            '0x' + walletAddress.slice(2).padStart(64, '0'),
          ],
          fromBlock: 1,
        })
        data.sort((n1, n2) => n2.blockNumber - n1.blockNumber)
        const arr = parseData(uniqBy(data, 'blockHash'))
        cacheList = arr
        setAllList(arr)
      }
    },
    [web3, walletAddress],
  )

  const getBlockTimestamp = useCallback(
    async (block: number) => {
      if (!promisesBlockTimestamp[block]) {
        promisesBlockTimestamp[block] = +(await web3!.eth.getBlock(block, false)).timestamp
      }
      return promisesBlockTimestamp[block]
    },
    [web3],
  )

  const getData = useCallback(
    async (pageIndex = 1, pageSize = 10) => {
      toggle()
      const start = (pageIndex - 1) * pageSize
      const data = allList.slice(start, start + pageSize)
      for (const item of data) {
        item.timestamp = await getBlockTimestamp(item.block)
      }
      toggle()
      setList(data)
    },
    [allList, getBlockTimestamp, toggle],
  )

  const refresh = useCallback(() => {
    fetchHistoryList(true)
  }, [fetchHistoryList])

  useEffect(() => {
    fetchHistoryList()
  }, [fetchHistoryList])

  return { list, getData, loading, refresh, total: allList.length }
}
