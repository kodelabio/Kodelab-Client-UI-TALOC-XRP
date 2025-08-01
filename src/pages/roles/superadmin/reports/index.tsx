import { Table, Modal, Button, Spin, message, Input, Space, Tooltip } from 'antd'
import React, { useEffect, useState } from 'react'
import apiService from '@/services/apiService'
import { CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons'
import useUserMangement from '@/hooks/useUserMangement'

export default () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loader, setLoader] = useState(false)
  const { user } = useUserMangement()
  const [reports, setReports] = useState([])

  const fetchReports = async () => {
    const response = await apiService.getReportList(user.walletAddress)

    if (response) {
      const updatedReports = await Promise.all(
        response.map(async (item) => {
          const clientDetails = await apiService.getUserByIdOrWallet(item?.owner)
          return { ...item, clientDetails }
        }),
      )

      // Format the reports data for the table
      const formattedReports = updatedReports.map((report, index) => ({
        key: index.toString(),
        date: report.timestamp,
        client: report.clientDetails?.data?.name || 'Unknown',
        reportName: report.type,
        status: report.status,
        // Store the original report data for use in the modal
        originalData: report,
      }))
      setReports(formattedReports)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleRowClick = (record) => {
    setSelectedReport(record)
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setSelectedReport(null)
    setIsVerifying(false)
  }

  const handleVerify = () => {
    setIsVerifying(true)

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false)

      // Update report status in real implementation
      const updatedReport = { ...selectedReport, status: 'Verified' }
      setSelectedReport(updatedReport)

      // Show success message
      message.success('The report has been verified successfully')

      // Close modal after a short delay
      setTimeout(() => {
        setIsModalVisible(false)
        setSelectedReport(null)
      }, 1000)
    }, 2000)
  }

  const handleDownload = () => {
    message.info('Downloading report...')
    // Implement download functionality here
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: '15%',
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      width: '20%',
    },
    {
      title: 'Report name',
      dataIndex: 'reportName',
      key: 'reportName',
      width: '45%',
      render: (text) => (
        <Tooltip title={text}>
          <div className="truncate-text">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '20%',
      render: (status) => {
        if (status === 'Verified') {
          return <span className="status-verified">Verified</span>
        } else {
          return <span className="status-not-verified">Not verified</span>
        }
      },
    },
  ]

  const detailsColumns = [
    {
      title: 'Activities',
      dataIndex: 'activities',
      key: 'activities',
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
    },
    {
      title: 'Total number of vaults',
      dataIndex: 'totalVaults',
      key: 'totalVaults',
    },
    {
      title: 'Value of new advances',
      dataIndex: 'newAdvances',
      key: 'newAdvances',
    },
    {
      title: 'Average interest rate (%)',
      dataIndex: 'interestRate',
      key: 'interestRate',
    },
    {
      title: 'Total interest outstanding',
      dataIndex: 'totalInterest',
      key: 'totalInterest',
    },
  ]

  return (
    <div className="report-dashboard">
      <div className="search-container">
        <Input prefix={<SearchOutlined />} placeholder="Search..." className="search-input" />
      </div>

      <Table
        columns={columns}
        dataSource={reports}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: record.status === 'Verified' ? 'verified-row' : 'not-verified-row',
        })}
        pagination={{
          current: currentPage,
          pageSize: 10,
          total: reports.length,
          onChange: setCurrentPage,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: (total) => `1-10 of ${total} data`,
          position: ['bottomCenter'],
        }}
      />

      {selectedReport && (
        <Modal
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{selectedReport.reportName}</span>
              <Button
                type="text"
                onClick={handleCancel}
                style={{ fontSize: '16px', fontWeight: 'bold' }}
                icon={<span style={{ fontSize: '20px' }}>×</span>}
              />
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
          centered
        >
          {selectedReport.details && (
            <div className="details-table-container">
              <table className="details-table">
                <thead>
                  <tr>
                    {detailsColumns.map((col) => (
                      <th key={col.key}>{col.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{selectedReport.details.activities}</td>
                    <td>{selectedReport.details.totalValue}</td>
                    <td>{selectedReport.details.totalVaults}</td>
                    <td>{selectedReport.details.newAdvances}</td>
                    <td>{selectedReport.details.interestRate}</td>
                    <td>{selectedReport.details.totalInterest}</td>
                  </tr>
                </tbody>
              </table>
              <div className="hash-link">{selectedReport.details.hashLink}</div>
            </div>
          )}

          <div className="modal-actions">
            {isVerifying ? (
              <div className="verifying-container">
                <Spin />
              </div>
            ) : selectedReport.status === 'Verified' ? (
              <Button type="primary" onClick={handleDownload} className="download-button">
                Download report
              </Button>
            ) : (
              <>
                {selectedReport?.originalData?.clientDetails?.data?.roleId === 2 && (
                  <Button type="primary" onClick={handleVerify} className="verify-button">
                    Verify
                  </Button>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
