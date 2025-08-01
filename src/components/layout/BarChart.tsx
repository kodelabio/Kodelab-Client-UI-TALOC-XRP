import { Skeleton, Tag } from 'antd'
import { ReactNode, useEffect, useState } from 'react'
import { getHistoryList } from '@/api/api'
import Chart from 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers'
import * as echarts from 'echarts'
import { useSessionStorage } from 'usehooks-ts'
import Canvas from '@/components/Canvas'
import styled from 'styled-components/macro'
import useMaker from '@/hooks/useMaker'
import useWeb3 from '@/hooks/useWeb3'

export default ({ vatAddress, fixedMortgag }) => {
  let dummyArray: any[] | (() => any[]) = []
  // const [historyList, setHistoryList] = useState(dummyArray)
  const [historyList, setHistoryList] = useSessionStorage('UserHistory', dummyArray)

  useEffect(() => {
    const fetchHistory = async () => {
      if (vatAddress) {
        try {
          const response = await getHistoryList(vatAddress)
          // Handle the response (e.g., update state with data)
          setHistoryList(response) // Replace with actual data if needed
        } catch (error) {

        } finally {
          // setLoader(false)
        }
      }
    }
    fetchHistory()
    // draw()
  }, [fixedMortgag, vatAddress])

  useEffect(() => {
    draw()
  }, [historyList])
  function getMonthsBetweenDates(startDate, endDate) {
    const months = []
    let currentDate = new Date(startDate)

    if (currentDate > endDate) {

      return []
    }

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1 // Month is zero-based, so we add 1
      // months.push(`${year}-${month.toString().padStart(2, '0')}`)
      months.push(new Date(currentDate))
      // Move to the next month
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    return months
  }

  // Function to get all days between two dates
  function getDaysBetweenDates(startDate, endDate) {
    const days = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      days.push(new Date(currentDate)) // Store actual Date object
      currentDate.setDate(currentDate.getDate() + 1) // Move to next day
    }

    return days
  }

  const draw = () => {
    if (historyList.length == 0) return
    var app = {
      configParameters: {},
      config: {},
    }

    let propertyFixMortgage = fixedMortgag

    let repaymentHistory = []
    let helocMortgageOutstanding = []

    historyList.forEach((tx) => {
      let [day, month, year] = tx.timestamp.split('/')
      tx.date = new Date(`${year}-${month}-${day}`)
    })

    // Check if historyList has data before setting startDate
    const startDate =
      historyList.length > 0
        ? new Date(Math.min(...historyList.map((tx) => tx.date.getTime())) - 0) // - 86400000 Subtract 1 day in milliseconds
        : new Date('2024-01-01') // Default start date if no history

    const endDate = new Date()

    //  by months start
    // endDate.setMonth(endDate.getMonth() + 1)
    // const monthsBetween = getMonthsBetweenDates(startDate, endDate)
    // let count = monthsBetween.length + 1
    // monthsBetween.forEach((month) => {
    //   let monthlyTransactions = historyList.filter(
    //     (tx) =>
    //       tx.date.getFullYear() === month.getFullYear() && tx.date.getMonth() === month.getMonth(),
    //   )

    //   console.log(monthlyTransactions)

    //   let repayAmount = monthlyTransactions
    //     .filter((tx) => tx.type === 'Repay')
    //     .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
    //   console.log('repayAmount', repayAmount)

    //   let borrowAmount = monthlyTransactions
    //     .filter((tx) => tx.type === 'Borrow')
    //     .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
    //   console.log('borrowAmount', borrowAmount)

    //   repaymentHistory.push({
    //     date: month.toISOString().split('T')[0], // Store as YYYY-MM-DD
    //     amount: repayAmount,
    //   })

    //   helocMortgageOutstanding.push({
    //     date: month.toISOString().split('T')[0],
    //     amount: borrowAmount,
    //   })

    //   count--
    // })
    //  by months end

    const daysBetween = getDaysBetweenDates(startDate, endDate)
    const daysDisplayBetween = daysBetween.map((day) => {
      return day.toLocaleDateString('en-GB') // Format as "DD/MM"
    })

    let count = daysBetween.length + 1

    daysBetween.forEach((day) => {
      let dailyTransactions = historyList.filter(
        (tx) =>
          tx.date.getFullYear() === day.getFullYear() &&
          tx.date.getMonth() === day.getMonth() &&
          tx.date.getDate() === day.getDate(),
      )

      let repayAmount = dailyTransactions
        .filter((tx) => tx.type === 'Repay')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

      let borrowAmount = dailyTransactions
        .filter((tx) => tx.type === 'Borrow')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

      repaymentHistory.push(repayAmount)

      helocMortgageOutstanding.push(borrowAmount)

      count--
    })

    // var myChart = echarts.init(ctx);
    var chartDom = document.getElementById('barchartdemo')

    var myChart = echarts.init(chartDom)
    var option

    const posList = [
      'left',
      'right',
      'top',
      'bottom',
      'inside',
      'insideTop',
      'insideLeft',
      'insideRight',
      'insideBottom',
      'insideTopLeft',
      'insideTopRight',
      'insideBottomLeft',
      'insideBottomRight',
    ]
    app.configParameters = {
      rotate: {
        min: -90,
        max: 90,
      },
      align: {
        options: {
          left: 'left',
          center: 'center',
          right: 'right',
        },
      },
      verticalAlign: {
        options: {
          top: 'top',
          middle: 'middle',
          bottom: 'bottom',
        },
      },
      position: {
        options: posList.reduce(function (map, pos) {
          map[pos] = pos
          return map
        }, {}),
      },
      distance: {
        min: 0,
        max: 100,
      },
    }
    app.config = {
      rotate: 90,
      align: 'left',
      verticalAlign: 'middle',
      position: 'insideBottom',
      distance: 15,
      onChange: function () {
        const labelOption = {
          rotate: app.config.rotate,
          align: app.config.align,
          verticalAlign: app.config.verticalAlign,
          position: app.config.position,
          distance: app.config.distance,
        }
        myChart.setOption({
          series: [
            {
              label: labelOption,
            },
            {
              label: labelOption,
            },
            {
              label: labelOption,
            },
            {
              label: labelOption,
            },
          ],
        })
      },
    }
    // 3E97FF
    // DEEDFF
    const labelOption = {
      show: true,
      position: app.config.position,
      distance: app.config.distance,
      align: app.config.align,
      verticalAlign: app.config.verticalAlign,
      rotate: app.config.rotate,
      formatter: '{c}  {name|{a}}',
      fontSize: 16,
      rich: {
        name: {},
      },
    }
    option = {
      tooltip: {
        trigger: 'axis',
        // axisPointer: {
        //   type: 'shadow'
        // }
      },
      legend: {
        left: 10,
        bottom: 10,
        data: ['Drawdown', 'Repayment'],
      },
      toolbox: {
        show: false,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: false },
          dataView: { show: false, readOnly: false },
          magicType: { show: false, type: ['line', 'bar', 'stack'] },
          restore: { show: false },
          saveAsImage: { show: false },
        },
      },
      xAxis: [
        // {
        //   type: 'category',
        //   axisTick: { show: false },
        //   data: monthsBetween,
        // },
        {
          type: 'category',
          axisTick: { show: false },
          data: daysDisplayBetween,
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          name: 'Repayment',
          type: 'bar',
          // label: labelOption,
          // emphasis: {
          //   focus: 'series'
          // },
          barWidth: '20%',
          color: '#45CC36',
          data: repaymentHistory,
        },
        {
          name: 'Drawdown',
          type: 'bar',
          barGap: 0.1,
          // label: labelOption,

          // emphasis: {
          //   focus: 'series'
          // },
          barWidth: '20%',
          color: '#33ACF7',

          data: helocMortgageOutstanding,
        },
      ],
    }

    myChart.setOption(option)
  }

  return (
    <div className="second-main-line-left">
      <div className="chart-tab" style={{ height: '100%' }}>
        {/* <div className="left-chart-title">Borrowed amount</div> */}
        {/* <div className="chart-tab-wrapper">
          <div className="chart-btn-wrap">
            <div className="total-btn-wrap">
              <div className="total-btn-wrap-text">Total</div>
            </div>
            <div className="borrowing-btn-wrap">
              <div className="borrowing-btn-wrap-text">Borrowing</div>
            </div>
          </div>
          <div className="chart-tab-info">
            <div className="borrowed-info">
              <div className="borrowed-info-elem"></div>
              <div className="borroved-info-text">Total borrowed</div>
            </div>
            <div className="ltv-info">
              <div className="ltv-info-elem"></div>
              <div className="ltv-info-text">Total LTV</div>
            </div>
          </div>
        </div> */}
        <div className="left-line-chart">
 
          <div className="barchart-demo" id="barchartdemo"></div>
        </div>
      </div>
    </div>
  )
}
