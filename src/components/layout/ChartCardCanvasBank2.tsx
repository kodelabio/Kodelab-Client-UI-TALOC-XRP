import { Skeleton, Tag } from 'antd'
import { ReactNode, useEffect } from 'react'
import React, { useRef } from 'react'
import Canvas from '@/components/Canvas'
import styled from 'styled-components/macro'
import useMaker from '@/hooks/useMaker'
import useWeb3 from '@/hooks/useWeb3'

interface DonutChartData {
  numberOfParts: number
  parts: {
    pt: number[]
  }
  colors: {
    cs: string[]
  }
}

interface DonutChartProps {
  x: number
  y: number
  radius: number
  lineWidth: number
  strokeStyle: string
  data: DonutChartData
  width: number
  height: number
  backgroundColor: string
}

const DonutChart: React.FC<DonutChartProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (ctx) {
        const { x, y, radius, lineWidth, data } = props

        // Clear the canvas before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const total = data.parts.pt.reduce((acc, part) => acc + part, 0)
        let startAngle = 180

        for (let i = 0; i < data.numberOfParts; i++) {
          const percentage = (data.parts.pt[i] / total) * 100
          const endAngle = startAngle + (Math.PI * 2 * percentage) / 100

          ctx.beginPath()
          ctx.lineWidth = lineWidth
          ctx.strokeStyle = data.colors.cs[i]
          ctx.arc(x, y, radius, startAngle, endAngle)
          ctx.stroke()
          ctx.lineCap = 'round' // butt, round or square

          startAngle = endAngle
        }
      }
    }
  }, [props])

  return (
    <canvas
      ref={canvasRef}
      width={props.width}
      height={props.height}
      style={{ backgroundColor: props.backgroundColor }}
    ></canvas>
  )
}

const DonutChartComponent: React.FC = ({ mortgageSumm, creditSumm, borrowedSumm }) => {
  // Define the data for the donut chart
  let chartTwo: DonutChartData = {
    numberOfParts: 3,
    parts: {
      pt: [mortgageSumm, creditSumm, borrowedSumm], // Percentage of each part
    },

    colors: {
      cs: ['#50CD89', '#F6C000', '#F1416C'], // Color of each part
    },
  }

  let chartOne: DonutChartData = {
    numberOfParts: 2,
    parts: {
      pt: [mortgageSumm, creditSumm], // Percentage of each part
    },

    colors: {
      cs: ['#50CD89', '#F6C000'], // Color of each part
    },
  }

  useEffect(() => {
    // console.log("CHART == >>>> m",mortgageSumm);
    // console.log("CHART == >>>> c",creditSumm)
    // console.log("CHART == >>>> b",borrowedSumm)
    // let chartValue = sessionStorage.getItem('chartValue')
    // console.log('indise  DonutChartComponent')
    // if (chartValue) {
    //   chartValue = JSON.parse(chartValue)
    //   // let total = (+chartValue['approveLoan'] - (+chartValue['borrowedSumm'])) + chartValue['mortgageSumm'];
    //   // console.log('b', (chartValue['approveLoan']/total)*100)
    //   // console.log('m',( chartValue['borrowedSumm']/total)*100)
    //   // console.log('a',( chartValue['mortgageSumm']/total)*100)
    //   // console.log('t', total)
    // }
  }, [])

  // charts size change here
  return (
    <>
      {borrowedSumm == 0 ? (
        <DonutChart
          x={100}
          y={100}
          radius={70}
          lineWidth={10}
          strokeStyle="#fff"
          data={chartOne}
          width={200}
          height={200}
        />
      ) : (
        <DonutChart
          x={100}
          y={100}
          radius={70}
          lineWidth={10}
          strokeStyle="#fff"
          data={chartTwo}
          width={200}
          height={200}
        />
      )}
    </>
  )
}

export default DonutChartComponent
