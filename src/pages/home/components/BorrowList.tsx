import { Button, Modal } from 'antd'
import Generate from './Generate'
import Payback from './Payback'
import TokenDetail from './TokenDetail'
import { useState } from 'react'
import { DAI } from '@/maker'
import { hideLoading, showLoading } from '@/utils'
import { createCurrency } from '@makerdao/currency'
import { useToggle } from 'ahooks'
import List from '@/components/List'
import RatioDisplay from '@/components/RatioDisplay'
import Table from '@/components/Table'
import Section from '@/components/layout/Section'
import { useCdpNft, withdrawNft } from '@/hooks/useCdpNft'
import useCdpTypes from '@/hooks/useCdpTypes'
import useMaker from '@/hooks/useMaker'
import { watch } from '@/hooks/useObservable'
import { prettifyNumber } from '@/utils/ui'

export const sidebarModalProps = {
  wrapClassName: 'sidebar-modal',
  destroyOnClose: true,
  maskStyle: { display: 'none' },
  maskClosable: false,
}
const BorrowList = ({ vaultDatas }: { vaultDatas: VaultData[] | undefined }) => {
  const [currentVaultIndex, setCurrentVaultIndex] = useState(-1)
  const { maker } = useMaker()
  const { cdpTypesList } = useCdpTypes()
  const debtCeilings: PlainObject<CurrencyX> = watch.collateralDebtCeilings(cdpTypesList)
  const [showToken, { toggle: toggleToken }] = useToggle()
  const [showGenerate, { toggle: toggleGenerate }] = useToggle()
  const [showPayBack, { toggle: togglePayBack }] = useToggle()
  const currentVault = vaultDatas ? vaultDatas[currentVaultIndex] : null

  const { nftAddresses } = useCdpNft()

  const showModal = (index: number, handle: () => void) => {
    setCurrentVaultIndex(index)
    handle()
  }

  const withdraw = ({ id, vaultType }: VaultData) => {
    showLoading()
    const symbol = vaultType.split('-')[0]
    maker
      .service('mcd:cdpManager')
      .wipeAndFree(id, vaultType, DAI(0), createCurrency(symbol)('1'))
      .then(async () => {
        await withdrawNft(nftAddresses[symbol])
      })
      .catch((error: any) => {

      })
      .finally(hideLoading)
  }
  const head = [
    'Vault no.',
    'Token',
    'Status',
    'Valuation',
    'Borrow limit',
    'Borrowed',
    'Collaterteralization ratio',
    'Action',
  ]

  return (
  
    <Section className="mH-400" title="Collateral list">
      <List total={vaultDatas?.length} loading={!maker} onChange={null}>
        <Table head={head}>
          {vaultDatas?.map((item, index) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                <span className="underline pointer" onClick={() => showModal(index, toggleToken)}>
                  {item.collateralAmount.symbol}
                </span>
              </td>
              <td>
                {+item.debtValue.toBigNumber().toFixed(4) > 0 ? (
                  <span>
                    <i className="fz-12" style={{ color: '#F7936F' }}>
                      ●
                    </i>{' '}
                    {'Locked'}
                  </span>
                ) : (
                  <span>
                    <i className="fz-12" style={{ color: '#66CB9F' }}>
                      ●
                    </i>{' '}
                    {'Unlocked'}
                  </span>
                )}
              </td>
              <td>{`${prettifyNumber(item.collateralValue, true, 2, false)}`} GBP</td>
              <td>{item.daiAvailable.toBigNumber().toFixed(2)}  HGBP</td>
              <td>{item.debtValue.toBigNumber().toFixed(6)}  HGBP</td>
              <td>
                {isFinite(item.collateralizationRatio.toNumber()) ? (
                  <RatioDisplay
                    fontSize={{ s: '1.7rem', xl: '1.3rem' }}
                    ratio={(item.collateralizationRatio.toBigNumber().toNumber() * 100).toFixed(2)}
                    ilkLiqRatio={item.liquidationRatio.toBigNumber().dp(4).times(100)}
                  />
                ) : (
                  'N/A'
                )}
              </td>
              <td>
                <Button
                  shape="round"
                  size="middle"
                  type="primary"
                  ghost
                  onClick={() => showModal(index, toggleGenerate)}
                >
                  Borrow
                </Button>
                {+item.debtValue.toBigNumber().toFixed(2) > 0 ? (
                  <Button
                    shape="round"
                    size="middle"
                    type="primary"
                    onClick={() => showModal(index, togglePayBack)}
                  >
                    Pay back
                  </Button>
                ) : (
                  <Button shape="round" size="middle" type="primary" onClick={() => withdraw(item)}>
                    Withdraw
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </List>
      <Modal open={showToken} title="Tokens Vault" destroyOnClose onCancel={toggleToken}>
        <TokenDetail tokenData={currentVault!} debtCeilings={debtCeilings} />
      </Modal>

      <Modal
        {...sidebarModalProps}
        onCancel={toggleGenerate}
        open={showGenerate}
        title="Generate  HGBP"
      >
        <Generate vault={currentVault!} close={toggleGenerate} />
      </Modal>
      <Modal
        {...sidebarModalProps}
        onCancel={togglePayBack}
        open={showPayBack}
        title="Pay back  HGBP"
      >
        <Payback vault={currentVault!} close={togglePayBack} />
      </Modal>
    </Section>
  )
}

export default BorrowList
