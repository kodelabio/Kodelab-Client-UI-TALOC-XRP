import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Button,
  Input,
  Pagination,
  Tabs,
  Space,
  Tooltip,
} from 'antd'
import VaultFilter from './VaultFilter'
import React, { useState, useEffect, useRef } from 'react'
import { getHistoryList } from '@/api/api'
import { getInterestRate, getInterest } from '@/api/blockchain'
import downloadArrowIcon from '@/assets/icons/down-arrow-icon.svg'
import filterIcon from '@/assets/icons/filter-icon.svg'
import searchIcon from '@/assets/icons/search-icon.svg'
import { SearchOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import { useSessionStorage } from 'usehooks-ts'
import BarChart from '@/components/layout/BarChart'

const { Title, Text } = Typography
const { TabPane } = Tabs

const VaultDashboard = () => {
  // Refs for chart containers
  const gaugeChartRef = useRef(null)
  const barChartRef = useRef(null)

  // Charts instances
  const [gaugeChart, setGaugeChart] = useState(null)
  const [barChart, setBarChart] = useState(null)
  const [selectedVault, setSelectedVault] = useSessionStorage('selectedVault', {}) //useState({})
  const [transactions, setTransactions] = useState([])
  const [vaultTransactionHistory, setVaultTransactionHistory] = useState([])
  const [interestPercentage, setInterestPercentage] = useState({
    value: '-',
    date: '-',
  })
  const [accuredInterest, setAccuredInterest] = useState('0')

  useEffect(() => {
    getVaultTransactionsHistory()
    getAccuredInterest()

    // Process the transaction history to match the table structure
    const formattedTransactions = vaultTransactionHistory.map((tx, index) => ({
      key: index.toString(),
      date: tx.timestamp,
      action: tx.type,
      amount: parseFloat(tx.amount),
      hash: tx.transactionHash,
      from: tx.from,
      to: tx.to,
      fromDetails: tx.fromDetails,
      toDetails: tx.toDetails,
    }))

    setTransactions(formattedTransactions)
    setInterestPercentage(getInterestRate())
  }, [vaultTransactionHistory, accuredInterest])

  const getVaultTransactionsHistory = async () => {
    try {
      const response = await getHistoryList(selectedVault.vatAddress)
      setVaultTransactionHistory(response)
    } catch (error) {

    } finally {
      // setLoader(false)
    }
  }

  const getAccuredInterest = () => {
    getInterest(selectedVault?.vatId).then((res) => {
      setAccuredInterest(res)
    })
  }

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: vaultTransactionHistory.length,
  })

  // Initialize gauge chart after component mounts
  useEffect(() => {
    if (gaugeChartRef.current) {
      const chart = echarts.init(gaugeChartRef.current)
      setGaugeChart(chart)

      // Handle resize
      const handleResize = () => {
        chart.resize()
      }
      window.addEventListener('resize', handleResize)

      return () => {
        chart.dispose()
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [gaugeChartRef])

  // Initialize bar chart
  useEffect(() => {
    if (barChartRef.current) {
      const chart = echarts.init(barChartRef.current)
      setBarChart(chart)

      // Handle resize
      const handleResize = () => {
        chart.resize()
      }
      window.addEventListener('resize', handleResize)

      return () => {
        chart.dispose()
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [barChartRef])

  // Update gauge chart when data changes
  useEffect(() => {
    if (gaugeChart && selectedVault) {
      const approvedLoanAmount = parseFloat(selectedVault.property.properties.approvedLoanAmount)
      const debt = parseFloat(selectedVault.debt)
      const borrowedPercentage = (debt / approvedLoanAmount) * 100 || 0

      const option = {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: '100%',
            axisLine: {
              lineStyle: {
                width: 10,
                color: [
                  [borrowedPercentage / 100, '#f1c40f'],
                  [1, '#3498db'],
                ],
              },
            },
            pointer: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            detail: {
              show: false,
            },
            data: [
              {
                value: borrowedPercentage,
              },
            ],
          },
        ],
      }

      gaugeChart.setOption(option)
    }
  }, [gaugeChart, selectedVault])

  // Update bar chart when data changes
  useEffect(() => {
    if (barChart) {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          data: ['Drawdown', 'Repayment'],
          bottom: 10,
          icon: 'rect',
          itemWidth: 10,
          itemHeight: 4,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '17%',
          top: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: months,
          axisLine: {
            lineStyle: {
              color: '#ddd',
            },
          },
        },
        yAxis: {
          type: 'value',
          name: '',
          min: 0,
          max: 200,
          interval: 100,
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: '#eee',
            },
          },
        },
        series: [
          {
            name: 'Drawdown',
            type: 'bar',
            barWidth: 10,
            stack: false,
            data: [90, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            color: '#3498db',
            z: 10,
          },
          {
            name: 'Repayment',
            type: 'bar',
            barWidth: 12,
            stack: false,
            data: [20, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120],
            color: '#2ecc71',
            z: 5,
          },
        ],
      }

      barChart.setOption(option)
    }
  }, [barChart, selectedVault])

  // Handle tab change for bar chart
  const handleTabChange = (key) => {
    // In a real application, you would fetch different data based on the tab
    if (barChart) {
      barChart.resize()
    }
  }

  // Columns for transaction table
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: '15%',
    },
    {
      title: 'Action type',
      dataIndex: 'action',
      key: 'action',
      width: '20%',
      render: (text) => {
        if (text === 'Borrow' || text === 'Drawdown') {
          return <span className="action-borrow">→ Borrow</span>
        } else if (text === 'Repayment' || text === 'Repay') {
          return <span className="action-repayment">← Fund Vault</span>
        } else if (text === 'Monthly payment') {
          return <span className="action-payment">📅 Monthly payment</span>
        } else {
          // Handle any other action types
          return <span style={{ wordBreak: 'break-all' }}>{text}</span>
        }
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: '15%',
      render: (amount) => {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount)
      },
    },
    {
      title: 'Transaction hash',
      dataIndex: 'hash',
      key: 'hash',
      width: '50%',
      render: (hash) => (
        <div className="hash-container">
          <span>{hash}</span>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => navigator.clipboard.writeText(hash)}
            className="copy-button"
          />
        </div>
      ),
    },
  ]

  // Handle pagination change
  const handleTableChange = (page) => {
    setPagination({
      ...pagination,
      current: page,
    })
  }

  function getNumber(str) {
    if (str == undefined || str == 0) {
      return 0
    }

    return parseFloat(String(str).replace(/,/g, ''))
  }

  // Calculate available credit
  const approvedLoanAmount = parseFloat(selectedVault.property.properties.approvedLoanAmount)
  const debt = parseFloat(selectedVault.debt)
  const availableCredit = approvedLoanAmount - debt

  // Determine risk level based on debt percentage
  const debtPercentage = (debt / approvedLoanAmount) * 100
  let riskLevel = 'Low'
  if (debtPercentage > 75) {
    riskLevel = 'High'
  } else if (debtPercentage > 50) {
    riskLevel = 'Medium'
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{selectedVault.property.name}</h1>
      </div>

      <Row gutter={[16, 16]}>
        {/* First Column: Asset Information Cards stacked vertically */}
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <div className="stacked-cards-container">
            <div className="stacked-card">
              <Card className="info-card">
                <div>
                  <Text type="secondary">Tokenised asset ID</Text>
                  <Title level={4} className="asset-id">
                    {selectedVault.tokenAddress}
                  </Title>
                </div>
              </Card>
            </div>

            <div className="stacked-card">
              <Card className="info-card">
                <div>
                  <Text type="secondary">Value</Text>
                  <Title level={4} className="value">
                    {new Intl.NumberFormat('en-US', {
                      style: 'decimal',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(parseFloat(selectedVault.property.properties.assetValue))}
                  </Title>
                </div>
              </Card>
            </div>

            <div className="stacked-card stacked-card-division">
              <Card className="info-card">
                <div>
                  <Text type="secondary">Interest rate</Text>
                  <Title level={4} className="interest-rate">
                    {parseFloat(interestPercentage.value)}%
                  </Title>
                </div>
              </Card>
              <Card className="info-card">
                <div>
                  <Text type="secondary">Accured Interest</Text>
                  <Title level={4} className="interest-rate">
                    HGBP{parseFloat(accuredInterest).toFixed(2)}
                  </Title>
                </div>
              </Card>
            </div>
          </div>
        </Col>

        {/* Second Column: Gauge Chart and Balance Information */}
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card className="chart-card" style={{ height: '100%' }}>
            <div className="limit-container">
              <div className="limit-header">
                <div className="limit-title">
                  <Text className="limit-amount">
                    {new Intl.NumberFormat('en-US', {
                      style: 'decimal',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(approvedLoanAmount)}
                  </Text>
                  <Text type="secondary">The limit amount</Text>
                </div>
                <div className="risk-indicator">
                  <span className={`risk-badge risk-${riskLevel.toLowerCase()}`}>{riskLevel}</span>
                </div>
              </div>
            </div>

            <div ref={gaugeChartRef} className="gauge-chart"></div>

            <Row className="balance-info">
              <Col span={12}>
                <div className="balance-item borrowed">
                  <Text className="balance-amount">
                    {new Intl.NumberFormat('en-US', {
                      style: 'decimal',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(debt)}
                  </Text>
                  <Text type="secondary">Borrowed</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="balance-item available">
                  <Text className="balance-amount">
                    {new Intl.NumberFormat('en-US', {
                      style: 'decimal',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(availableCredit)}
                  </Text>
                  <Text type="secondary">Available credit</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Third Column: Bar Chart */}
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card className="chart-card" style={{ height: '100%' }}>
            <div className="chart-header">
              <Text strong>Chart</Text>
              {/* <Tabs defaultActiveKey="week" onChange={handleTabChange} className="chart-tabs">
                <TabPane tab="Week" key="week" />
                <TabPane tab="Month" key="month" />
                <TabPane tab="Year" key="year" />
              </Tabs> */}
              <Tabs
                defaultActiveKey="week"
                onChange={handleTabChange}
                className="chart-tabs"
                items={[
                  {
                    label: 'Week',
                    key: 'week',
                  },
                  {
                    label: 'Month',
                    key: 'month',
                  },
                  {
                    label: 'Year',
                    key: 'year',
                  },
                ]}
              />
            </div>
            {/* <div ref={barChartRef} className="bar-chart"></div> */}
            <BarChart
              vatAddress={selectedVault?.vatAddress}
              fixedMortgag={getNumber(selectedVault['property']['properties']['originalLoanValue'])}
            ></BarChart>
          </Card>
        </Col>

        {/* Transaction History */}
        <Col span={24}>
          <div className="transaction-header">
            <Title level={4}>Transaction history</Title>
            <Space>
              <VaultFilter />
              <button className="download-btn">
                <img src={downloadArrowIcon} alt="download report" />
                Report
              </button>
              <div className="search-bar">
                <img src={searchIcon} alt="search" />
                <input type="text" placeholder="Search..." />
              </div>
            </Space>
          </div>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <Table
              columns={columns}
              dataSource={transactions}
              pagination={false}
              className="transaction-table"
              rowClassName="transaction-row"
            />
            <div className="pagination-wrapper">
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={handleTableChange}
                showSizeChanger={false}
                showQuickJumper
                itemRender={(page, type, originalElement) => {
                  if (type === 'page' && page === 1) {
                    return <a className="ant-pagination-item-active">1</a>
                  }
                  if (type === 'page' && page === 2) {
                    return <a>2</a>
                  }
                  if (type === 'page' && page === 9) {
                    return <a>9</a>
                  }
                  if (type === 'prev') {
                    return <a>‹</a>
                  }
                  if (type === 'next') {
                    return <a>›</a>
                  }
                  if (type === 'jump-next' || type === 'jump-prev') {
                    return <a>...</a>
                  }
                  return originalElement
                }}
              />
            </div>

            <div className="pagination-info">
              <Text type="secondary">1-10 of {pagination.total} data</Text>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default VaultDashboard
