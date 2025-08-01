import { Button, Input, message, Modal } from 'antd'
import { FullScreen } from './Proposal'
import Redeem from './Redeem'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { abiAddresses, ZERO_ADDRESS } from '@/constants'
import { Erc20, MCD_ADM } from '@/constants/abi/types'
import { fromWei, hideLoading, showLoading, toWei } from '@/utils'
import { useToggle } from 'ahooks'
import { approve } from '@/hooks/useErc20TokenAllowance'
import useWeb3 from '@/hooks/useWeb3'
import { format_num } from '@/utils/format'
import { getAdmContract, getErc20Contract } from '@/utils/getContract'

export const BaseGov = ({
  voteAddress = '',
  onFinish,
}: {
  voteAddress?: string
  onFinish?: () => void
}) => {
  const { web3, walletAddress } = useWeb3()
  const [amount, setAmount] = useState('')
  const [depositAmount, setDepositAmount] = useState(0)
  const [iouBalnce, setIouBalance] = useState('')
  const [showRedeem, { toggle }] = useToggle()
  const [address, setAddress] = useState(voteAddress)

  const contract = useMemo(() => {
    return {
      admContract: web3 ? getAdmContract().contract : {},
      hocContract: web3 ? getErc20Contract(abiAddresses.MCD_GOV).contract : {},
      iouContract: web3 ? getErc20Contract(abiAddresses.MCD_IOU).contract : {},
    } as {
      admContract: MCD_ADM
      hocContract: Erc20
      iouContract: Erc20
    }
  }, [web3])

  const queryAmount = useCallback(async () => {
    const depositAmount = await contract.admContract.methods.deposits(walletAddress).call()
    setDepositAmount(+fromWei(depositAmount))
    const balance = await contract.iouContract.methods.balanceOf(walletAddress).call()
    setIouBalance(fromWei(balance))
  }, [contract, walletAddress])

  useEffect(() => {
    if (walletAddress) {
      queryAmount()
    }
  }, [queryAmount, walletAddress])

  const lockAndVote = async (amount: string) => {
    const { admContract } = contract
    if (!web3?.utils.isAddress(address)) {
      message.error('投票地址无效')
      return
    }
    try {
      showLoading('正在授权中')
      await approve(abiAddresses.MCD_GOV, abiAddresses.MCD_ADM, amount)
      showLoading('正在锁定HOC')
      await admContract.methods.lock(toWei(amount)).send()
      showLoading('投票中')
      //@ts-ignore
      await admContract.methods.vote([address]).send()
      queryAmount()
      onFinish?.()
      message.success('质押成功')
      setAmount('')
    } catch (error) {
      message.error('质押失败')
    } finally {
      hideLoading()
    }
  }

  return (
    <div className="bd-all p-40">
      {voteAddress && (
        <>
          <p className="fz-16 bold">已质押数量</p>
          <p className="mt-10 mb-20">
            <span className="fz-16 bold">{format_num(depositAmount)} HOC </span>
            {+iouBalnce > 0 && (
              <span onClick={toggle} className="link-text" style={{ marginLeft: 10 }}>
                赎回
              </span>
            )}
          </p>
        </>
      )}
      <div className="w-340">
        <p className="mb-10">质押数量</p>
        <Input value={amount} suffix="HOC" onChange={(e) => setAmount(e.target.value)} />
      </div>
      {!voteAddress && (
        <div className="mt-20 w-340">
          <p className="mb-10">投票地址</p>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      )}
      <Button
        shape="round"
        type="primary"
        className="web-btn mt-40 w-340"
        disabled={!amount || !address}
        onClick={() => lockAndVote(amount)}
      >
        质押
      </Button>

      <Modal destroyOnClose={true} width={460} title="赎回质押" open={showRedeem} onCancel={toggle}>
        <Redeem
          balance={iouBalnce}
          onFinish={() => {
            queryAmount()
            onFinish?.()
            toggle()
          }}
        />
      </Modal>
    </div>
  )
}

export default () => {
  const { web3, walletAddress } = useWeb3()
  const [totalVotes, setTotalVotes] = useState('')
  const [live, setLive] = useState(false)

  const contract = useMemo(() => {
    return {
      admContract: web3 ? getAdmContract().contract : {},
      iouContract: web3 ? getErc20Contract(abiAddresses.MCD_IOU).contract : {},
    } as {
      admContract: MCD_ADM
      iouContract: Erc20
    }
  }, [web3])

  const queryAmount = useCallback(async () => {
    const { live } = contract.admContract.methods
    const { totalSupply } = contract.iouContract.methods

    setTotalVotes(fromWei(await totalSupply().call()))
    setLive(await live().call())
  }, [contract])

  useEffect(() => {
    if (walletAddress) {
      queryAmount()
    }
  }, [queryAmount, walletAddress])

  const startLive = async () => {
    showLoading()
    try {
      await contract.admContract.methods.launch().send()
      message.success('启动治理成功')
      setLive(true)
    } catch (error) {
      message.error('启动治理失败')
    }
    hideLoading()
  }

  return (
    <FullScreen>
      <div className="wrap">
        {walletAddress ? (
          <div>
            <div className="fz-30 mb-40">启动治理</div>
            <div className="flex">
              <div className="f1">
                <BaseGov onFinish={queryAmount} voteAddress={ZERO_ADDRESS} />
              </div>
              <div className="bd-all p-40 ml-30" style={{ width: 380 }}>
                <p className="fz-16 bold">总质押量</p>
                <p className="mt-10 fz-16 bold mb-20 cgreen">{format_num(totalVotes)} HOC</p>
                <p className="mb-10">总质押量超过 80K 可开启治理投票</p>
                <div className="input-wrap rel " style={{ visibility: 'hidden' }}>
                  <input />
                </div>
                <Button
                  shape="round"
                  type="primary"
                  className="web-btn mt-30"
                  disabled={+totalVotes < 80000 || live}
                  onClick={startLive}
                  style={{ width: 300 }}
                >
                  {live ? '已启动治理' : '启动治理'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center pt-100">请先连接钱包</div>
        )}
      </div>
    </FullScreen>
  )
}
