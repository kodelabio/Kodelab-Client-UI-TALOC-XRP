import { Button, message } from 'antd'
import { PageProps, ProposalData } from './Proposal'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BsArrowLeftShort } from 'react-icons/bs'
import { hideLoading, showLoading } from '@/utils'
import useWeb3 from '@/hooks/useWeb3'
import { getSpellContract } from '@/utils/getContract'

export default ({ setRouter, id }: PageProps) => {
  const { contract } = getSpellContract()
  const [isVote, setIsVote] = useState(false)
  const [item, setItem] = useState<Partial<ProposalData>>({})
  const { walletAddress } = useWeb3()
  const queryVoted = useCallback(() => {
    if (!walletAddress) return
    contract.methods
      .isApproved(walletAddress, id)
      .call()
      .then((res) => {
        setIsVote(res)
      })
  }, [contract, id, walletAddress])

  useEffect(() => {
    if (contract) {
      contract.methods
        .getProposalMSG(id)
        .call()
        .then((res) => {
          setItem(res)
        })

      queryVoted()
    }
  }, [contract, id, queryVoted])

  const handleSubmit = async () => {
    try {
      showLoading()
      await contract.methods.vote(id).send()
      message.success('投票成功')
    } catch (error) {
      message.error('投票失败')
    } finally {
      hideLoading()
      queryVoted()
    }
  }
  return (
    <>
      <div
        className="back mb-20 pointer fz-16 row c-primary"
        onClick={() => {
          setRouter('list')
        }}
      >
        <BsArrowLeftShort size={24} /> 返回
      </div>
      <div className="bd-all bd-eee p-30">
        <p className="fz-30 mb-40">新资产投票详情</p>
        <div className="row mb-30">
          <span className="w-160">提案ID</span>
          <span>{id}</span>
        </div>
        <div className="row mb-30">
          <span className="w-160">SPELL合约地址</span>
          <span>{item.spell}</span>
        </div>
        <div className="row mb-30">
          <span className="w-160">提案状态</span>
          <span>{item.status === '0' ? '投票中' : item.status === '1' ? '成功' : '失败'}</span>
        </div>
        <div>
          <p className="mb-10">SPELL合约描述</p>
          <span>{item.desc}</span>
        </div>
        <Button
          shape="round"
          type="primary"
          className="w-200 mt-40"
          disabled={isVote}
          onClick={handleSubmit}
        >
          {isVote ? '已赞成' : '赞成'}
        </Button>
      </div>
    </>
  )
}
