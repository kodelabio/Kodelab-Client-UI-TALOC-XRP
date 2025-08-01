import { Button, Input, message } from 'antd'
import { PageProps } from './Proposal'
import { useState } from 'react'
import { BsArrowLeftShort } from 'react-icons/bs'
import { hideLoading, showLoading } from '@/utils'
import { getSpellContract } from '@/utils/getContract'

export default ({ setRouter, setRefresh }: PageProps) => {
  const { contract, web3 } = getSpellContract()
  const [address, setAddress] = useState('')
  const [desc, setDesc] = useState('')

  const handleSubmit = () => {
    if (!contract) return
    if (!web3.utils.isAddress(address)) {
      message.error('合约地址格式不正确')
      return
    }
    showLoading()
    contract.methods
      .sendProposal(address, desc)
      .send()
      .then(() => {
        message.success('发起提案成功')
        setAddress('')
        setDesc('')
        setRefresh(Date.now())
      })
      .catch(() => {
        message.error('发起提案失败')
      })
      .finally(hideLoading)
  }
  return (
    <>
      <div
        className="back mb-20 fz-16 pointer c-primary row"
        onClick={() => {
          setRouter('list')
        }}
      >
        <BsArrowLeftShort size={24} /> 返回
      </div>
      <div className="bd-all p-30">
        <p className="fz-30 mb-30">发起提案</p>
        <div className="input-wrap mb-30">
          <div className="label mb-10">SPELL合约地址</div>
          <Input
            className="w-600"
            placeholder="请填写合约地址"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></Input>
        </div>
        <div className="input-wrap mb-30">
          <div className="label mb-10">SPELL合约描述</div>
          <Input.TextArea
            className="w-600"
            placeholder="请填写spell合约功能描述， 字符串描述或文档URI"
            value={desc}
            rows={4}
            onChange={(e) => setDesc(e.target.value)}
          ></Input.TextArea>
        </div>
        <Button
          shape="round"
          type="primary"
          className="w-200"
          disabled={!address || !desc}
          onClick={handleSubmit}
        >
          提交
        </Button>
      </div>
    </>
  )
}
