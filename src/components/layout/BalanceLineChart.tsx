import { Skeleton, Tag } from 'antd'
import { ReactNode, useEffect } from 'react'
import Chart from 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers'
import * as echarts from 'echarts'
import Canvas from '@/components/Canvas'
import styled from 'styled-components/macro'
import useMaker from '@/hooks/useMaker'
import useWeb3 from '@/hooks/useWeb3'

export default ({}) => {
  useEffect(() => {
   
    draw()
  }, [])

  const draw = () => {
    var app = {
      configParameters: {},
      config: {},
    }

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
    let base = +new Date()
    let oneDay = 24 * 3600 * 1000
    let data = [[base, Math.random() * 300]]
    for (let i = 1; i < 210; i++) {
      let now = new Date((base -= oneDay))
      var num = Math.round((Math.random() - 0.5) * 20 + data[i - 1][1]);
        if(num < 0){
          num = num * -1;
        }

        data.push([+now, num])
   
       
    }

    
// insert dummy data for the line chart
    // let dummyData = [[1685555348813, 1499],[1685555348813, 123],[1685555348823, 181],[1685555348813, 181],[1685555348813, 181],[1685555348813, 181],[1685555348813, 181],[1685555348813, 181],[1685555348813, 181],[1685555348813, 181],[1685555348813, 181],[1685555348813, 181]]

    // data = dummyData;
    // console.log(' line ... data ..... ' , data)
    // 3E97FF
    // DEEDFF
  

    option = {
      tooltip: {
        // trigger: 'axis',
        // position: function (pt) {
        //   return [pt[0], '10%']
        // },
      },
      // title: {
      //   left: 'center',
      //   text: 'Balance',
      // },
      toolbox: {
        feature: {
          // dataZoom: {
          //   yAxisIndex: 'none',
          // },
          // restore: {},
          // saveAsImage: {},
        },
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 20,
        },
        {
          start: 0,
          end: 20,
        },
      ],
      series: [
        {
          name: 'Fake Data',
          type: 'line',
          smooth: true,
          symbol: 'none',
          areaStyle: {
            color:'#3E97FF'
          },
          data: data,
          color: '#0079FF',
        },
      ],
    }

    myChart.setOption(option)
  }

  return (
    <div className="balance-line-chart">
      <div className="chart-tab">
        <div className='balance-chart-headline'>
        <div className="left-chart-title">Balance</div>
        <div className="month-select">
                <select
                  className="month-select"
                  data-control="select2"
                  data-hide-search="true"
                  data-dropdown-css-classname="w-150px"
                  data-placeholder="Month"
                  data-kt-table-widget-4="filter_status"
                >
                  <option  value="January ">January </option>
                  <option  value="February ">February</option>
                  <option  value="March">March</option>
                  <option value="March">April</option>
                  <option value="March">May</option>
                  <option value="March">June</option>
                  <option value="March">July</option>
                  <option value="March">August</option>
                  <option value="March">September</option>
                  <option value="March">October</option>
                  <option value="March">November</option>
                  <option value="March">December</option>
                </select>
              </div>
        </div>
        <div className="balance-chart" style={{ height: '450px' }}>

          <div className='canvas-tab' style={{ width: '100%', height: '100%' }} id="barchartdemo"></div>
        </div>
      </div>
    </div>
  )
}
