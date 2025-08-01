import { Skeleton, Tag } from 'antd'
import { ReactNode, useEffect } from 'react'
import { getTransactionList } from '@/api/blockchain'
import optimiseBtnIcon from '@/assets/icons/optimiseBtnIcon.svg'
import Canvas from '@/components/Canvas'
import ChartCardCanvasBank2 from '@/components/layout/ChartCardCanvasBank2'
import styled from 'styled-components/macro'
import useMaker from '@/hooks/useMaker'
import useWeb3 from '@/hooks/useWeb3'

export default ({
  title,
  numberOfVault,
  lowRisk,
  avgRisk,
  highRisk,
  valueText,
  value,
  mortgageText,
  mortgageSumm,
  creditText,
  creditSumm,
  borrowedText,
  borrowedSumm,
  approveLoan,
  btnName,
  modalToggled,
}) => {
  useEffect(() => {}, [mortgageSumm, creditSumm, borrowedSumm, approveLoan])

  const draw = (ctx) => {
    let chartValue = sessionStorage.getItem('chartValue')

    if (chartValue) {
      chartValue = JSON.parse(chartValue)
    }

    // context.fillStyle = "rgb(200, 0, 0)";
    // context.fillRect(10, 10, 50, 50);

    // context.fillStyle = "rgba(0, 0, 200, 0.5)";
    // context.fillRect(30, 30, 50, 50);

    var options = {
      size: 235,
      lineWidth: 35,
      rotate: 145,
      //percent:  el.getAttribute('data-kt-percent') ,
    }

    var radius = (options.size - options.lineWidth) / 2
    ctx.translate(options.size / 2, options.size / 2) // change center
    ctx.rotate((-1 / 2 + options.rotate / 180) * Math.PI) // rotate -90 deg

    var drawCircle = function (color, lineWidth, percent) {
      percent = Math.min(Math.max(0, percent || 1), 1)
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2 * percent, false)
      ctx.strokeStyle = color
      ctx.lineCap = 'round' // butt, round or square
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }

    // let total =( +chartValue['approveLoan'] - ( +chartValue['borrowedSumm'])) + chartValue['mortgageSumm'];
    // console.log('b', borrowedSumm)
    // console.log('m', mortgageSumm)
    // console.log('a', approveLoan)
    // console.log('t', total)

    if (borrowedSumm) {
      // drawCircle('#9954A7', options.lineWidth, +borrowedSumm / total) // borrow
      // drawCircle('#2DD4F2', options.lineWidth, +approveLoan / total) // av
      // drawCircle('#004C7C', options.lineWidth, +mortgageSumm / total) // fm

      // drawCircle('#9954A7', options.lineWidth, total / (total + (+chartValue['borrowedSumm']))) // borrow
      // drawCircle('#2DD4F2', options.lineWidth, total / (total + ( +chartValue['approveLoan'] - ( +chartValue['borrowedSumm'])))) // av
      // drawCircle('#004C7C', options.lineWidth, total / (total + (+chartValue['mortgageSumm']))) // fm
      // var sliceAngle1 = (+chartValue['borrowedSumm'] / total) * 2 * Math.PI;
      // var sliceAngle2 = (+chartValue['approveLoan' ]/ total) * 2 * Math.PI;
      // var sliceAngle3 = (+chartValue['mortgageSumm'] / total) * 2 * Math.PI;

      drawCircle('#9954A7', options.lineWidth, 100 / 90) // borrow
      drawCircle('#2DD4F2', options.lineWidth, 100 / 110) // av
      drawCircle('#004C7C', options.lineWidth, 100 / 160) // fm
    } else {
      // drawCircle('#004C7C', options.lineWidth, (+mortgageSumm / total) * 360) //fm
      // drawCircle('#2DD4F2', options.lineWidth, (+approveLoan / total) * 360) //av
      // drawCircle('#004C7C', options.lineWidth, total / (total + (+chartValue['mortgageSumm']))) //fm
      // drawCircle('#2DD4F2', options.lineWidth, total / (total + (+chartValue['approveLoan']))) //av

      drawCircle('#004C7C', options.lineWidth, 100 / 100) //fm 1
      drawCircle('#2DD4F2', options.lineWidth, 100 / 200) //av 2
    }
  }

  return (
    <div className="card-one">
      <div className="card-two">
        <div
          className="card-header  d-flex flex-row"
          style={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div className="card-title d-flex flex-column">
            <div className="tab-title">{title}</div>
            <div className="description-wrapper" style={{ visibility: 'hidden' }}>
              <span className="description-summ">{valueText}</span>

              <span className="description-summa">
                {(Math.fround(value * 10000) / 10000)
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </span>

              {/* <!--begin::Badge--> */}
              {/* <!-- <span className="badge badge-light-success fs-base">
                              <i className="ki-duotone ki-arrow-up fs-5 text-success ms-n1">
                                  <span className="path1"></span>
                                  <span className="path2"></span>
                              </i>2.2%</span> --> */}
              {/* <!--end::Badge--> */}
            </div>
          </div>
          {/* <div className="summary-optimise-btn" onClick={() => { getTransactionList() }}></div> */}
        </div>

        <div className="card-body-bank">
          <div className="round-chart" style={{ margin: '5px', position: 'relative' }}>
            <div className="card-inner-wrap">
              <div className="card-inner-summ">{numberOfVault}</div>
              <div className="card-inner-title">Vaults</div>
            </div>
            <span>
              <ChartCardCanvasBank2
                mortgageSumm={mortgageSumm}
                creditSumm={creditSumm}
                borrowedSumm={borrowedSumm}
                numberOfParts={3}
              />
            </span>
          </div>
          <div className="labels-wrapper-bank">
            <div className="label-low">
              <div className="label-title">{mortgageText}</div>

              <div className="label-value">
                <span>{lowRisk}</span>
                {/* <span>$</span> */}
                {/* {mortgageSumm} */}
                {/* {(Math.fround(mortgageSumm * 10000) / 10000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} */}
              </div>
            </div>

            <div className="label-average">
              <div className="label-title">{creditText}</div>
              <div className="label-value">
                <span>{avgRisk}</span>
                {/* {creditSumm} */}
                {/* {(Math.fround(creditSumm * 10000) / 10000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} */}
              </div>
            </div>
            <div className="label-high">
              <div className="label-title">{borrowedText}</div>

              <div className="label-value">
                <span>{highRisk}</span>
                {/* {(Math.fround(borrowedSumm * 10000) / 10000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} */}
                {/* {borrowedSumm} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
