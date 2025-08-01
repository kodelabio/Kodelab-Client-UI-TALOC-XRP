import { useEffect, useReducer, useState } from 'react'
import { TxLifecycle } from '@/constants'
import classNames from 'classnames'
import styled from 'styled-components'
import Title from '@/components/layout/Title'
import CreateConfirmCDP from '@/pages/vault/components/CreateConfirmCDP'
import DepositNft from '@/pages/vault/components/DepositNft'
import SelectCollateral from '@/pages/vault/components/SelectCollateral'
import SetAllowance from '@/pages/vault/components/SetAllowance'
import { getUserNft, NftInfo } from '@/hooks/useCdpNft'
import useCdpTypes from '@/hooks/useCdpTypes'
import { watch } from '@/hooks/useObservable'
import useProxy from '@/hooks/useProxy'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useWalletBalances from '@/hooks/useWalletBalances'

export type Action = {
  type: 'set-step' | 'set-ilk' | 'form/set-daiToDraw' | 'transaction-confirmed'
  payload: any
}

export type StepComponentsProps = {
  selectedIlk: {
    userGemBalance: string
    currency: CreatorFn
    gem: string
    symbol: string
    isHolder: false
    wrapAddress: string
  }
  hasAllowance: boolean
  proxyAddress: string
  balances: Record<string, BigNumber>
  collateralTypesData: CollateralTypeData[] | undefined
  hasSufficientAllowance: (value: string | number, decimals?: number) => boolean
  userNftList: NftInfo[] | undefined
  cdpParams: {
    gemsToLock: string
    daiToDraw: string
    txState: string
  }
  dispatch: React.Dispatch<Action>
}

type FadeProps = {
  active: boolean
  toLeft: boolean
  toRight: boolean
}

const StepWrap = styled.div`
  display: flex;
  margin: 10px 0 40px;
  .item {
    padding-top: 20px;
    flex: 1;
    border-top: 4px solid #e5e7eb;
    &.diff {
      border-color: ${({ theme }) => '#464A53'};
    }
    &:not(:last-child) {
      margin-right: 70px;
    }
  }
`

const FadeIn = styled.div<FadeProps>`
  opacity: 0;
  top: 0;
  position: absolute;
  pointer-events: none;

  ${(props) =>
    props.active &&
    `
    transform: translateX(0);
    transition: all 0.7s;
    position: relative;
    opacity: 1;
    pointer-events: unset;
  `}

  ${(props) =>
    props.toLeft &&
    `
    opacity: 0;
    transform: translateX(-50px);
  `}

  ${(props) =>
    props.toRight &&
    `
    opacity: 0;
    transform: translateX(50px);
  `}
`

const initialState = {
  step: 0,
  selectedIlk: {
    userGemBalance: '',
    currency: null,
    gem: '',
    symbol: '',
    isHolder: false,
    wrapAddress: '',
  },
  gemsToLock: '1',
  daiToDraw: '',
  txState: '',
}

function reducer(state: typeof initialState, action: Action) {
  const { type, payload } = action
  switch (type) {
    case 'set-step':
      return {
        ...state,
        step: state.step + payload,
      }
    case 'set-ilk':
      return {
        ...state,
        selectedIlk: { ...payload },
      }
    case 'form/set-daiToDraw':
      return { ...state, daiToDraw: payload.value }
    case 'transaction-confirmed':
      return { ...state, txState: TxLifecycle.CONFIRMED }
    default:
      return state
  }
}

export default () => {
  const list = ['Select collateral', 'Vault management', 'Generate  HGBP', 'Confirmation']
  const StepCompoments = [SelectCollateral, SetAllowance, DepositNft, CreateConfirmCDP]
  const { proxyAddress } = useProxy()
  const { cdpTypesList } = useCdpTypes()
  const collateralTypesData: CollateralTypeData[] | undefined =
    watch.collateralTypesData(cdpTypesList)

  const balances: Record<string, BigNumber> = useWalletBalances()

  let [{ step, selectedIlk, ...cdpParams }, dispatch] = useReducer(reducer, initialState)

  const { hasAllowance, hasSufficientAllowance } = useTokenAllowance(selectedIlk?.currency?.symbol)

  const [userNftList, setUserNftList] = useState<NftInfo[]>()
  useEffect(() => {
    if (step === 0) {
      fetchNft()
    }
    let timer = setInterval(() => {
      if (step === 0) {
        fetchNft()
      }
    }, 8000)
    return () => {
       clearInterval(timer)
    }
  }, [step])
  const fetchNft = () => {
    getUserNft().then((res) => {
      setUserNftList(res)
    })
  }

  const props: StepComponentsProps = {
    selectedIlk,
    hasAllowance,
    proxyAddress,
    balances,
    collateralTypesData,
    hasSufficientAllowance,
    userNftList,
    cdpParams,
    dispatch,
  }
  return (
    <div>
      <Title back title="New Vault"></Title>
      <div className="p-30 rel ovd">
        <StepWrap>
          {list.map((item, index) => (
            <div key={index} className={classNames('item', { diff: step >= index })}>
              <div className="fz-12 o-5">Step {index + 1}</div>
              <p>{item}</p>
            </div>
          ))}
        </StepWrap>

        {StepCompoments.map((Item, index) => (
          <FadeIn key={index} toLeft={index < step} toRight={index > step} active={index === step}>
            {index === step && <Item {...props} />}
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
