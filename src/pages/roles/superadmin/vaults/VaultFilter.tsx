import { Drawer, Button, Space, DatePicker, Row, Col, Typography, Input, Slider } from 'antd'
import React, { useState, useEffect, useRef } from 'react'
import filterIcon from '@/assets/icons/filter-icon.svg'
import { FilterOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import moment from 'moment'

const { Title, Text } = Typography

const VaultFilter = () => {
  const [visible, setVisible] = useState(false)
  const [actionTypes, setActionTypes] = useState({
    borrow: true,
    repayment: true,
  })
  const [dateRange, setDateRange] = useState({
    from: moment('2025-03-06'),
    to: moment('2025-03-31'),
  })
  const [amountRange, setAmountRange] = useState([0, 150000000])
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const chartRef = useRef(null)
  const amountChartRef = useRef(null)

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
      return 500 // Original width for larger screens
    }
  }

  useEffect(() => {
    if (visible && chartRef.current) {
      const chartInstance = echarts.init(chartRef.current)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          data: ['Borrow', 'Repayment'],
          bottom: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar'],
          },
        ],
        yAxis: [
          {
            type: 'value',
            max: 200,
            splitLine: {
              lineStyle: {
                type: 'dashed',
              },
            },
          },
        ],
        series: [
          {
            name: 'Borrow',
            type: 'bar',
            data: [90, 100, 80],
            itemStyle: {
              color: '#1890ff',
            },
          },
          {
            name: 'Repayment',
            type: 'bar',
            data: [30, 140, 50],
            itemStyle: {
              color: '#52c41a',
            },
          },
        ],
      }

      chartInstance.setOption(option)

      // Handle resize
      const resizeChart = () => {
        chartInstance.resize()
      }

      window.addEventListener('resize', resizeChart)

      return () => {
        chartInstance.dispose()
        window.removeEventListener('resize', resizeChart)
      }
    }
  }, [visible])

  useEffect(() => {
    if (visible && amountChartRef.current) {
      const chartInstance = echarts.init(amountChartRef.current)

      // Generate random data for the amount distribution
      const amountData = Array(30)
        .fill()
        .map(() => Math.floor(Math.random() * 70 + 10))

      const option = {
        grid: {
          left: '2%',
          right: '2%',
          top: '3%',
          bottom: '3%',
          containLabel: false,
        },
        xAxis: {
          type: 'category',
          show: false,
          data: Array(30)
            .fill()
            .map((_, i) => i + 1),
        },
        yAxis: {
          type: 'value',
          show: false,
        },
        series: [
          {
            data: amountData,
            type: 'bar',
            barWidth: '60%',
            itemStyle: {
              color: '#1890ff',
            },
          },
        ],
      }

      chartInstance.setOption(option)

      // Handle resize
      const resizeChart = () => {
        chartInstance.resize()
      }

      window.addEventListener('resize', resizeChart)

      return () => {
        chartInstance.dispose()
        window.removeEventListener('resize', resizeChart)
      }
    }
  }, [visible])

  const showDrawer = () => {
    setVisible(true)
  }

  const handleClose = () => {
    setVisible(false)
  }

  const toggleActionType = (type) => {
    setActionTypes({
      ...actionTypes,
      [type]: !actionTypes[type],
    })
  }

  const handleFromDateChange = (date) => {
    setDateRange({
      ...dateRange,
      from: date,
    })
  }

  const handleToDateChange = (date) => {
    setDateRange({
      ...dateRange,
      to: date,
    })
  }

  const handleAmountChange = (value) => {
    setAmountRange(value)
  }

  const handleClearAll = () => {
    setActionTypes({ borrow: true, repayment: true })
    setDateRange({
      from: moment('2025-03-06'),
      to: moment('2025-03-31'),
    })
    setAmountRange([0, 150000000])
  }

  const handleApplyFilter = () => {
    handleClose()
  }

  const formatCurrency = (value) => {
    return value.toLocaleString()
  }

  return (
    <>
      <img src={filterIcon} alt="filter" onClick={showDrawer} style={{ cursor: 'pointer' }} />
      <Drawer
        title={
          <span
            style={{
              fontSize: '26px',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}
          >
            Filter
          </span>
        }
        placement="right"
        closable={false}
        onClose={handleClose}
        open={visible}
        width={getDrawerWidth()}
        extra={
          <Button type="text" onClick={handleClose} style={{ border: 'none' }}>
            ×
          </Button>
        }
        footer={
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '10px 0' }}
          >
            <Button onClick={handleClearAll} style={{ borderRadius: 36 }}>
              Clear all
            </Button>
            <Button type="primary" onClick={handleApplyFilter} style={{ borderRadius: 36 }}>
              Apply filter
            </Button>
          </div>
        }
        headerStyle={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            Action type
          </Title>
          <Space size={12} wrap>
            <Button
              type={actionTypes.borrow ? 'default' : 'text'}
              style={{
                backgroundColor: actionTypes.borrow ? '#f0f0f0' : 'transparent',
                borderRadius: 20,
                height: 'auto',
                padding: '6px 16px',
                border: 'none',
                marginBottom: '8px',
              }}
              onClick={() => toggleActionType('borrow')}
            >
              Borrow
            </Button>
            <Button
              type={actionTypes.repayment ? 'default' : 'text'}
              style={{
                backgroundColor: actionTypes.repayment ? '#f0f0f0' : 'transparent',
                borderRadius: 20,
                height: 'auto',
                padding: '6px 16px',
                border: 'none',
                marginBottom: '8px',
              }}
              onClick={() => toggleActionType('repayment')}
            >
              Repayment
            </Button>
          </Space>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            Date range
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Text>From</Text>
              <DatePicker
                value={dateRange.from}
                onChange={handleFromDateChange}
                style={{ width: '100%', marginTop: 4 }}
                format="MMM D, YYYY"
                allowClear={false}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Text>To</Text>
              <DatePicker
                value={dateRange.to}
                onChange={handleToDateChange}
                style={{ width: '100%', marginTop: 4 }}
                format="MMM D, YYYY"
                allowClear={false}
              />
            </Col>
          </Row>
        </div>

        {/* Chart Section */}

        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            Amount
          </Title>
          <div ref={amountChartRef} style={{ height: 100, width: '100%', marginBottom: 16 }} />
          <Slider
            range
            min={0}
            max={150000000}
            value={amountRange}
            onChange={handleAmountChange}
            tipFormatter={formatCurrency}
            marks={{
              0: {
                style: { transform: 'translateX(0%)' },
                label: <div style={{ fontSize: 10 }}>|||</div>,
              },
              150000000: {
                style: { transform: 'translateX(-100%)' },
                label: <div style={{ fontSize: 10 }}>|||</div>,
              },
            }}
          />
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col xs={24} sm={12}>
              <Text>Minimum</Text>
              <Input
                value={formatCurrency(amountRange[0])}
                onChange={(e) => {
                  const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
                  handleAmountChange([value, amountRange[1]])
                }}
                style={{ width: '100%', marginTop: 4, borderRadius: 20 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Text>Maximum</Text>
              <Input
                value={formatCurrency(amountRange[1])}
                onChange={(e) => {
                  const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
                  handleAmountChange([amountRange[0], value])
                }}
                style={{ width: '100%', marginTop: 4, borderRadius: 20 }}
              />
            </Col>
          </Row>
        </div>
      </Drawer>
    </>
  )
}

export default VaultFilter
