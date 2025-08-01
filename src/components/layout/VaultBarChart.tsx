// VaultBarChart.tsx
import ChartHeader from './ToggleSwitch'
import ToggleSwitch from './ToggleSwitch'
import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'

interface VaultBarChartProps {
  data: { day: string; value: number }[]
  totalVaults: number
  range: string
}

const VaultBarChart: React.FC<VaultBarChartProps> = ({ data, totalVaults, range }) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartInstance = useRef<echarts.EChartsType | null>(null)
  const [selected, setSelected] = useState('week')

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    return () => {
      chartInstance.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption({
        title: [
          {
            text: `${totalVaults}`,
            left: 'left',
            top: 10,
            textStyle: {
              fontSize: 28,
              color: '#0A47B6',
              fontWeight: 'bold',
            },
          },
          {
            text: 'Number of vaults',
            left: 'left',
            top: 50,
            textStyle: {
              fontSize: 18,
              color: '#888',
            },
          },
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        grid: {
          top: 100,
          left: '3%',
          right: '4%',
          bottom: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: data.map((d) => d.day),
          axisTick: { show: false },
          axisLabel: { fontSize: 14 },
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: { type: 'dashed', color: '#ddd' },
            show: false,
          },
        },
        series: [
          {
            data: data.map((d) => d.value),
            type: 'bar',
            barWidth: '40%',
            itemStyle: {
              color: 'rgba(43, 94, 203, 0.3)',
              borderRadius: [8, 8, 0, 0],
            },
            label: {
              show: true,
              position: 'top',
              fontSize: 14,
            },
          },
        ],
      })
    }
  }, [data, totalVaults])

  return (
    <div>
      <div
        style={{
          fontSize: 14,
          marginBottom: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {range}
        <ToggleSwitch value={selected} onChange={setSelected} />
      </div>
      <div ref={chartRef} style={{ width: '100%', height: 220 }} />
    </div>
  )
}

export default VaultBarChart
