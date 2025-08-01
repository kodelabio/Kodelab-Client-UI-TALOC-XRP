import { Skeleton, Tag } from 'antd'
import { ReactNode, useEffect } from 'react'
import Canvas from '@/components/Canvas'
import styled from 'styled-components/macro'
import useMaker from '@/hooks/useMaker'
import useWeb3 from '@/hooks/useWeb3'

export default ({
  title,
  valueText,
  value,
  mortgageText,
  mortgageSumm,
  creditText,
  creditSumm,
  borrowedText,
  borrowedSumm,
  approveLoan,
  colors,
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
      size: 155,
      lineWidth: 15,
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

      drawCircle(colors[0], options.lineWidth, 100 / 90) // borrow
      drawCircle(colors[1], options.lineWidth, 100 / 110) // av
      drawCircle(colors[2], options.lineWidth, 100 / 160) // fm
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
    <div className="dashboard-card-one">
      <div className="card-header">
        <div className="card-title d-flex flex-column">
          <div className="dashboard-tab-title">{title}</div>

          <div className="description-wrapper">
            <span className="description-summ">{valueText}</span>

            <span className="dashboard-description-summa">{value}</span>

            {/* <!-- <span className="badge badge-light-success fs-base">
                                <i className="ki-duotone ki-arrow-up fs-5 text-success ms-n1">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                </i>2.2%</span> --> */}
          </div>
        </div>
      </div>

      <div className="dashboard-card-body">
        <div className="dashboard-round-chart">
          {/* <div id="kt_card_widget_17_chart_JP" style={{ minWidth: '245px', minHeight: '245px' }}
                        data-kt-size="250" data-kt-line="35"></div> */}
          <span>
            <Canvas
              draw={draw}
              height={235}
              width={245}
              mortgageSumm={mortgageSumm}
              creditSumm={creditSumm}
              borrowedSumm={borrowedSumm}
            />
          </span>
        </div>
        <div className="lable-wrapper">
          <div className="dashboard-label-mortgage">
            <div
              className="bullet w-8px h-3px rounded-2 bg-success me-3"
              style={{ backgroundColor: ' #004C7C !important' }}
            ></div>

            <div className="dashboard-label-title">{mortgageText}</div>

            <div className="dashboard-label-value">
              <span>$</span>
              {mortgageSumm}
            </div>
          </div>

          <div className="dashboard-label-total">
            <div
              className="bullet w-8px h-3px rounded-2 bg-primary me-3"
              style={{ backgroundColor: '#2DD4F2 !important' }}
            ></div>

            <div className="dashboard-label-title">{creditText}</div>

            <div className="dashboard-label-value">
              <span>$</span>
              {creditSumm}
            </div>
          </div>

          <div className="dashboard-label-borrow">
            <div
              className="bullet w-8px h-3px rounded-2 me-3"
              style={{ backgroundColor: '#9954A7' }}
            ></div>

            <div className="dashboard-label-title">{borrowedText}</div>

            <div className="dashboard-label-value">
              <span>$</span>
              {borrowedSumm}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
