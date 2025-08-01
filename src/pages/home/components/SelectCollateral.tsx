import { Button, message, Radio, Spin } from 'antd'
import Table from '../../../components/Table'
import { Display } from '../../../components/layout/Display'
import Section from '../../../components/layout/Section'
import { StepComponentsProps } from '../CreateVault'
import { tableHead } from './TableHead'
import { useMemo } from 'react'
import { hideLoading, showLoading } from '@/utils'
import { useToggle } from 'ahooks'
import BigNumber from 'bignumber.js'
import List from '@/components/List'
import { approveNft, queryApprove, useCdpNft } from '@/hooks/useCdpNft'
import { withdrawNft } from '@/hooks/useCdpNft'
import useCdpTypes from '@/hooks/useCdpTypes'
import { getMaxDaiAvailable } from '@/utils/cdp'
import { prettifyNumber, formatter } from '@/utils/ui'

const IlkData = ({ ilkData }: { ilkData: CollateralTypeData }) => {
  const { annualStabilityFee, liquidationRatio, liquidationPenalty } = ilkData
  return (
    <>
      <td>
        {formatter(annualStabilityFee, {
          percentage: true,
          rounding: BigNumber.ROUND_HALF_UP,
        })}{' '}
        %
      </td>
      <td>{+prettifyNumber(liquidationRatio, true, 2, false) * 100} %</td>

      <td>{formatter(liquidationPenalty, { percentage: true })} %</td>
      <td>{prettifyNumber(getMaxDaiAvailable(ilkData), true)}</td>
    </>
  )
}

const SelectCollateral = ({
  selectedIlk,
  hasAllowance,
  proxyAddress,
  balances,
  collateralTypesData,
  userNftList,
  dispatch,
}: StepComponentsProps) => {
  const { cdpTypes } = useCdpTypes()
  const hasAllowanceAndProxy = hasAllowance && !!proxyAddress
  const [approveing, { toggle }] = useToggle()

  const { nftAddresses } = useCdpNft()

  const getNftInfo = (wrapAddress: string) => {
    return userNftList?.find((item) => item.wrapAddress === wrapAddress)!
  }
  const submit = async () => {
    try {
      const { id, isHolder, nftAddress } = getNftInfo(selectedIlk.wrapAddress)
      if (!isHolder) {
        toggle()
        const approved = await queryApprove(selectedIlk.wrapAddress, id, nftAddress)
        if (!approved) {
          await approveNft(selectedIlk.wrapAddress, id, nftAddress)
        }
      }
      dispatch({
        type: 'set-step',
        payload: hasAllowanceAndProxy && isHolder ? 2 : 1,
      })
    } catch (error) {

      message.error('Approve failed')
    } finally {
      toggle()
    }
  }

  const list = useMemo(() => {
    return cdpTypes.filter((item) =>
      userNftList?.find((nft) => nft.wrapAddress === item.wrapAddress),
    )
  }, [cdpTypes, userNftList])

  const handleWithdrawNft = (symbol: string) => {
    showLoading()
    withdrawNft(nftAddresses[symbol])
      .then(() => {
        message.success('Successful ')
      })
      .catch(() => {
        message.error('Error')
      })
      .finally(hideLoading)
  }

  return (
    <div>
      <p className="fz-18 mtb-20">Select NFT collateral</p>
      <Section>
        <List total={list.length} loading={!collateralTypesData || !userNftList} onChange={null}>
          <Table
            css={`
              thead tr {
                background: none;
              }
              th,
              td {
                text-align: left;
                height: 60px !important;
              }
            `}
            head={tableHead}
          >
            {collateralTypesData &&
              list.map((ilk) => (
                <tr
                  className={`fz-16 ${selectedIlk.symbol === ilk.symbol ? 'active' : ''}`}
                  key={ilk.symbol}
                  onClick={() => {
                    dispatch({
                      type: 'set-ilk',
                      payload: {
                        ...ilk,
                        userGemBalance: balances[ilk.gem],
                        isHolder: getNftInfo(ilk.wrapAddress).isHolder,
                      },
                    })
                  }}
                >
                  <td style={{ paddingRight: '14px' }}>
                    <Radio checked={selectedIlk.symbol === ilk.symbol} />
                  </td>
                  <td>{ilk.symbol}</td>
                  <IlkData ilkData={collateralTypesData.find((x) => x.symbol === ilk.symbol)!} />
                  {getNftInfo(ilk.wrapAddress).isHolder && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        shape="round"
                        type="primary"
                        ghost
                        onClick={() => handleWithdrawNft(ilk.gem)}
                      >
                        Withdraw
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
          </Table>
        </List>
      </Section>
      <Display show={!!selectedIlk.symbol} className="pt-30">
        The dust limit for {selectedIlk.symbol} treasurys is{' '}
        {prettifyNumber(
          collateralTypesData?.find(({ symbol }) => symbol === selectedIlk.symbol)?.debtFloor,
        )}
         HGBP. The dust limit is the minimum amount of  HGBP that can be generated in a treasury.
        <p>
          Please make sure you have enough collateral to generate at least this amount of  HGBP
          before continuing.
        </p>
      </Display>
      <div className="mt-50">
        <Button
          shape="round"
          className="w-160"
          type="primary"
          onClick={submit}
          loading={approveing}
          disabled={!selectedIlk.symbol}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
export default SelectCollateral
