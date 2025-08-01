import { Button } from 'antd'
import SetupProxy from '../../../components/SetupProxy'
import Grid from '../../../components/layout/Grid'
import Section from '../../../components/layout/Section'
import { StepComponentsProps } from '../CreateVault'
import { useCallback, useEffect, useState } from 'react'
import { BsCheck } from 'react-icons/bs'
import { getWrapHolder } from '@/hooks/useCdpNft'
import useProxy from '@/hooks/useProxy'
import useTokenAllowance from '@/hooks/useTokenAllowance'

const SetAllowance = ({ selectedIlk, dispatch }: StepComponentsProps) => {
  const { proxyAddress, proxyLoading } = useProxy()
  const { gem, wrapAddress } = selectedIlk
  const {
    hasAllowance,
    setAllowance,
    allowanceLoading: isSettingAllowance,
  } = useTokenAllowance(gem, wrapAddress)

  const [isHolder, setIsHolder] = useState(false)
  const queryHolder = useCallback(async () => {
    const res = await getWrapHolder(wrapAddress)

     setIsHolder(res)
  }, [wrapAddress])

  useEffect(() => {
    queryHolder()
  }, [queryHolder, hasAllowance, isSettingAllowance])

  const setStep = (val: number) => {
    dispatch({
      type: 'set-step',
      payload: val,
    })
  }

  return (
    <div>
      <Section>
        <Grid className="p-30">
          <SetupProxy />
          
          {hasAllowance && isHolder ? (
            <Button shape="round" className="w-160" type="primary" disabled>
              <BsCheck size={24} />
            </Button>
          ) : (
            <Button
              shape="round"
              className="w-160"
              type="primary"
              onClick={setAllowance}
              disabled={!proxyAddress || proxyLoading || isSettingAllowance}
              loading={isSettingAllowance}
            >
              Set
            </Button>
          )}
        </Grid>
      </Section>

      <div className="mt-50">
        <Button shape="round" className="w-160" onClick={() => setStep(-1)} disabled={proxyLoading}>
          Back
        </Button>

        <Button
          shape="round"
          className="w-160"
          type="primary"
          onClick={() => setStep(1)}
          disabled={!proxyAddress || !hasAllowance || !isHolder}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default SetAllowance
