import { Button, Radio, InputNumber, Space, Row, Col, Typography, Drawer } from 'antd'
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { CloseOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import debounce from 'lodash/debounce'

const { Title } = Typography

// Helper function to generate random histogram data
const generateHistogramData = (count) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 100))
}

const EChartsHistogram = ({ data, height = '100px', id }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  // Memoize the chart options to prevent unnecessary re-renders
  const getChartOptions = useMemo(() => {
    return {
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      xAxis: {
        type: 'category',
        show: false,
        data: data.map((_, index) => index),
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          data: data,
          type: 'bar',
          barWidth: '90%',
          itemStyle: {
            color: '#4096ff',
          },
          emphasis: {
            itemStyle: {
              color: '#1677ff',
            },
          },
          animation: {
            duration: 1000, // Slow down the animation
            easing: 'cubicOut',
          },
        },
      ],
      tooltip: {
        show: false,
      },
      animation: true,
      animationDuration: 1000, // Slow down the overall animation
      animationEasing: 'cubicOut',
    }
  }, [data])

  // Debounced resize handler to prevent rapid re-renders
  const handleResize = useMemo(
    () =>
      debounce(() => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.resize()
        }
      }, 300),
    [],
  )

  useEffect(() => {
    // Only initialize the chart once
    if (!chartInstanceRef.current && chartRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current)
    }

    // Set chart options
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setOption(getChartOptions, true)
    }

    // Add resize event listener
    window.addEventListener('resize', handleResize)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)

      // Only dispose the chart when component unmounts
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose()
        chartInstanceRef.current = null
      }
    }
  }, [data, getChartOptions, handleResize])

  return <div id={id} ref={chartRef} style={{ width: '100%', height }} />
}

const FilterComponent = ({ visible, onClose }) => {
  // Generate sample data for histograms only once on component mount
  const [valueHistogramData] = useState(() => generateHistogramData(25))
  const [limitHistogramData] = useState(() => generateHistogramData(25))

  const [riskLevel, setRiskLevel] = useState('average')
  const [valueRange, setValueRange] = useState([5000000, 150000000])
  const [limitRange, setLimitRange] = useState([0, 150000000])

  // Add state to track screen width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Update window width when resized
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Calculate drawer width based on screen size
  const getDrawerWidth = () => {
    if (windowWidth <= 576) {
      return '100%' // Full width on mobile
    } else if (windowWidth <= 768) {
      return '80%' // 80% width on small tablets
    } else {
      return 580 // Original width for larger screens
    }
  }

  const handleApplyFilter = () => {
    onClose()
  }

  const handleClearAll = () => {
    setRiskLevel('average')
    setValueRange([5000000, 150000000])
    setLimitRange([0, 150000000])
  }

  // Custom slider with ECharts
  const CustomRangeSlider = ({ range, onChange, min, max, histogramData, id }) => {
    const [sliderValue, setSliderValue] = useState(range)

    // Handle slider change
    const handleSliderChange = (e) => {
      const value = e.target.value
      setSliderValue(value)
      onChange(value)
    }

    return (
      <div style={{ position: 'relative', width: '100%', marginBottom: '30px' }}>
        <EChartsHistogram data={histogramData} id={id} />
        <div style={{ position: 'relative', margin: '8px 0' }}>
          <input
            type="range"
            min={min}
            max={max}
            value={sliderValue[0]}
            onChange={(e) => {
              const newValue = Number(e.target.value)
              if (newValue <= sliderValue[1]) {
                setSliderValue([newValue, sliderValue[1]])
                onChange([newValue, sliderValue[1]])
              }
            }}
            style={{
              position: 'absolute',
              width: '100%',
              zIndex: 2,
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={sliderValue[1]}
            onChange={(e) => {
              const newValue = Number(e.target.value)
              if (newValue >= sliderValue[0]) {
                setSliderValue([sliderValue[0], newValue])
                onChange([sliderValue[0], newValue])
              }
            }}
            style={{
              position: 'absolute',
              width: '100%',
              zIndex: 2,
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <Drawer
      title={
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Filter
            </Title>
          </Col>
          <Col>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              style={{ border: 'none' }}
            />
          </Col>
        </Row>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={getDrawerWidth()}
      closable={false}
      footer={
        <Row justify="end" style={{ padding: '10px 0' }}>
          <Space>
            <Button onClick={handleClearAll}>Clear all</Button>
            <Button type="primary" onClick={handleApplyFilter}>
              Apply filter
            </Button>
          </Space>
        </Row>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Risk Level Selection */}
        <div>
          <Title level={5} style={{ marginBottom: 16 }}>
            Risk
          </Title>
          <Radio.Group
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            style={{ color: '#498fec !important' }}
          >
            <Space wrap>
              <Radio.Button
                value="low"
                style={{
                  borderRadius: 50,
                  backgroundColor: riskLevel === 'low' ? 'white' : '#f5f5f5',
                  padding: '0 15px',
                  marginBottom: '8px',
                }}
              >
                Low
              </Radio.Button>
              <Radio.Button
                value="average"
                style={{
                  borderRadius: 50,
                  backgroundColor: riskLevel === 'average' ? 'white' : '#f5f5f5',
                  padding: '0 15px',
                  marginBottom: '8px',
                }}
              >
                {riskLevel === 'average' && (
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    Average
                    <CloseOutlined
                      style={{ marginLeft: 8, fontSize: '10px' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setRiskLevel(null)
                      }}
                    />
                  </span>
                )}
                {riskLevel !== 'average' && 'Average'}
              </Radio.Button>
              <Radio.Button
                value="high"
                style={{
                  borderRadius: 50,
                  backgroundColor: riskLevel === 'high' ? 'white' : '#f5f5f5',
                  padding: '0 15px',
                  marginBottom: '8px',
                }}
              >
                High
              </Radio.Button>
            </Space>
          </Radio.Group>
        </div>

        {/* Value Range */}
        <div>
          <Title level={5} style={{ marginBottom: 16 }}>
            Value range
          </Title>
          <EChartsHistogram data={valueHistogramData} id="value-histogram" />
          <div style={{ position: 'relative', marginTop: '8px', height: '40px' }}>
            <div
              style={{
                position: 'absolute',
                left: '5px',
                fontSize: '12px',
                color: '#8c8c8c',
              }}
            >
              Minimum
            </div>
            <div
              style={{
                position: 'absolute',
                right: '5px',
                fontSize: '12px',
                color: '#8c8c8c',
              }}
            >
              Maximum
            </div>
          </div>

          <Row gutter={[16, 16]} justify="space-between" style={{ marginTop: 16 }}>
            <Col xs={24} sm={11}>
              <InputNumber
                style={{ width: '100%', borderRadius: 50 }}
                value={valueRange[0]}
                min={0}
                max={valueRange[1]}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value.replace(/\$\s?|(,*)/g, ''))}
                onChange={(value) => setValueRange([value, valueRange[1]])}
              />
            </Col>
            <Col xs={24} sm={11}>
              <InputNumber
                style={{ width: '100%', borderRadius: 50 }}
                value={valueRange[1]}
                min={valueRange[0]}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value.replace(/\$\s?|(,*)/g, ''))}
                onChange={(value) => setValueRange([valueRange[0], value])}
              />
            </Col>
          </Row>
        </div>

        {/* Limit Amount Range */}
        <div>
          <Title level={5} style={{ marginBottom: 16 }}>
            Limit amount range
          </Title>
          <EChartsHistogram data={limitHistogramData} id="limit-histogram" />
          <div style={{ position: 'relative', marginTop: '8px', height: '40px' }}>
            <div
              style={{
                position: 'absolute',
                left: '5px',
                fontSize: '12px',
                color: '#8c8c8c',
              }}
            >
              Minimum
            </div>
            <div
              style={{
                position: 'absolute',
                right: '5px',
                fontSize: '12px',
                color: '#8c8c8c',
              }}
            >
              Maximum
            </div>
          </div>

          <Row gutter={[16, 16]} justify="space-between" style={{ marginTop: 16 }}>
            <Col xs={24} sm={11}>
              <InputNumber
                style={{ width: '100%', borderRadius: 50 }}
                value={limitRange[0]}
                min={0}
                max={limitRange[1]}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value.replace(/\$\s?|(,*)/g, ''))}
                onChange={(value) => setLimitRange([value, limitRange[1]])}
              />
            </Col>
            <Col xs={24} sm={11}>
              <InputNumber
                style={{ width: '100%', borderRadius: 50 }}
                value={limitRange[1]}
                min={limitRange[0]}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value.replace(/\$\s?|(,*)/g, ''))}
                onChange={(value) => setLimitRange([limitRange[0], value])}
              />
            </Col>
          </Row>
        </div>
      </Space>
    </Drawer>
  )
}

export default FilterComponent
