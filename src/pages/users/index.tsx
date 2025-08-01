import { useCallback, useEffect, useState, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { getUserList } from '@/api/api'
import selectBtn from '@/assets/icons/rightIcon.svg'
import sendBtn from '@/assets/icons/supportSendBlue.svg'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'
import logoImg from '@/assets/img/moblogo.png'
import CheckIcon from '@/assets/theme/img/checkBox.svg'
import { elements } from 'chart.js'
import styled from 'styled-components/macro'
import useUserMangement from '@/hooks/useUserMangement'

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button, message, Modal } from 'antd'

import { useTheme } from "../../context/ThemeContext";
import { useSessionStorage } from 'usehooks-ts'

const ContainerWrap = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`

const UserTabsWrapper = styled.div`
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  min-height: 350px;
  margin-bottom: 30px;
  max-width: 1500px;
`

const UserTab = styled.div`
  cursor: pointer;
  transition: transform 0.9s ease;
  position: absolute;
  align-items: center;
  display: flex;
`

export default () => {
  const MAX_STEPPER = 1
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [termAndCondition, setTermAndCondition] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  let dummyArray: any[] | (() => any[]) = []
  const [userList, setUserList] = useState(dummyArray)
  const router = useNavigate()
  const { login } = useUserMangement()
  const [password, setPassword] = useState('')
  const selectedUser = userList[selectedIndex]
  const passwordInputRef = useRef(null)

  const pdfComponentRef = useRef<HTMLDivElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { setTheme } = useTheme();

  // swipe
  const [startX, setStartX] = useState(null)
  const [endX, setEndX] = useState(null)

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    setEndX(e.changedTouches[0].clientX)
    handleSwipe()
  }

  const handleSwipe = () => {
    if (startX && endX) {
      const swipeDistance = startX - endX

      if (swipeDistance > 150) {
        userNext()
      } else if (swipeDistance < -150) {
        userBack()
      }
    }
    setStartX(null)
    setEndX(null)
  }
  // swipe

  const handleKeyPress = useCallback(
    (event) => {
      if (!passwordInputRef.current || document.activeElement !== passwordInputRef.current) {
        if (event.key === 'ArrowLeft') {
          userBack()
        } else if (event.key === 'ArrowRight') {
          userNext()
        }
      }
    },
    [userBack, userNext],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])
  const [user, setUser] = useSessionStorage("selectedUser",null)

  useEffect(() => {
    // let user = sessionStorage.getItem('selectedUser')
     if (user) {
       // user = JSON.parse(user)
    
      if (user.id == 54) {
        sessionStorage.setItem(
          'selectedVault',
          '{"property":{"name":"98 Ho Chung Road, Sai Kung, Hong Kong","description":"HELOC token issued by Kodelab  to represent a customer loan on property address: 98 Ho Chung Road, Sai Kung, Hong Kong","image":"https://portal-integ.toko.network/v1/juno/download_document?doc_id=public-4crsfVSN6kTxHwT9RSvraA&filename=public-ripple_project_customer_3.png&hash=sha512-a8827c17f2a02600279aa5414f40476a76d55685ba047f7bfa838f297d37b4b5fd7e2e5fb0cb9ad24b39eca429ec5f34123ac69d4b7c703c9f79f5de774aec36","properties":{"loanNumber":"HLN53962","ownerWalletAddress":"0xbEb159bDB1A8Eb6545A4dCa5E8e395F293e0128d","customerNumber":"CN013673","addressLine1":"98 Ho Chung Rd","addressLine2":"Sai Kung","city":"Hong Kong","country":"China","assetValue":"25,000,000","assetValuationDate":"10/31/2023","loanCurrency":" HGBP","originalLoanValue":"1,200,000","maximumLoanPercentage":"40%","approvedLoanAmount":"1,200,000","talocCurrency":"Hypothetical e- HGBP","defaultFlag":"No"}},"tokenAddress":"0xAdB218157Fdeb4a6389A5c108D42f48E1B290B0d","value":"499995.0860157402574922","debt":"700004.9139842597425078","interest":"0","time":"1694710167","vatId":"1"}',
        )
        router('/home/view/FCAreports')
      }else if (user.id == 55) {
        sessionStorage.setItem(
          'selectedVault',
          '{"property":{"name":"98 Ho Chung Road, Sai Kung, Hong Kong","description":"HELOC token issued by Kodelab  to represent a customer loan on property address: 98 Ho Chung Road, Sai Kung, Hong Kong","image":"https://portal-integ.toko.network/v1/juno/download_document?doc_id=public-4crsfVSN6kTxHwT9RSvraA&filename=public-ripple_project_customer_3.png&hash=sha512-a8827c17f2a02600279aa5414f40476a76d55685ba047f7bfa838f297d37b4b5fd7e2e5fb0cb9ad24b39eca429ec5f34123ac69d4b7c703c9f79f5de774aec36","properties":{"loanNumber":"HLN53962","ownerWalletAddress":"0xbEb159bDB1A8Eb6545A4dCa5E8e395F293e0128d","customerNumber":"CN013673","addressLine1":"98 Ho Chung Rd","addressLine2":"Sai Kung","city":"Hong Kong","country":"China","assetValue":"25,000,000","assetValuationDate":"10/31/2023","loanCurrency":" HGBP","originalLoanValue":"1,200,000","maximumLoanPercentage":"40%","approvedLoanAmount":"1,200,000","talocCurrency":"Hypothetical e- HGBP","defaultFlag":"No"}},"tokenAddress":"0xAdB218157Fdeb4a6389A5c108D42f48E1B290B0d","value":"499995.0860157402574922","debt":"700004.9139842597425078","interest":"0","time":"1694710167","vatId":"1"}',
        )
        router('/home/bank/dashboard')
      } else {
        router('/property')
      }
    } else {
      sessionStorage.clear()
      router('/users')
    }
  }, [user])

  useEffect(() => {
    let uList = getUserList()
    setUserList(uList)
  }, [userList])

  function next() {
    if (selectedIndex != -1) {
      if (password != '' && password == 'kodelab') {

        setTheme(userList[selectedIndex].theme || "kodelabTheme");

        login(userList[selectedIndex]);

      } else {
        // alert('Password incorrect')
        message.error('Password incorrect')
        passwordInputRef.current.focus()
        setPassword('')
      }
    } else {
      // alert('please select user to login')
      message.error('Please select a user to login')
      passwordInputRef.current.focus()
      setPassword('')
    }
  }

  function userBack() {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  function userNext() {
    if (selectedIndex < userList.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }
  // const handlePrint = useReactToPrint({
  //   content: () => pdfComponentRef.current,
  //   documentTitle: 'exported-document',
  // })

  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileName, setFileName] = useState("");

  async function handlePrint() {
    const element = pdfComponentRef.current;
    // Ensure full content is captured, including scrollable areas
    window.scrollTo(0, 0);

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Fix issues with external images
      scrollY: -window.scrollY, // Capture full scrollable content
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Open the PDF in a new tab
    // window.open(pdf.output("bloburl"), "_blank");
    // Generate Blob URL for PDF preview
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfUrl);
    setIsModalOpen(true);
    // Auto-download the PDF
    // pdf.save("download.pdf");
    // Format filename as "xyz--YYYY-MM-DD.pdf"
    // Get the current date & time for filename
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = now.toLocaleTimeString("en-GB").replace(/:/g, "-"); // HH-MM-SS (24-hour format)
    const generatedFileName = `doc--${formattedDate}--${formattedTime}.pdf`;
    setFileName(generatedFileName);

    // Auto-download with custom name when clicking the download button
    const downloadLink = document.createElement("a");
    downloadLink.href = pdfUrl;
    downloadLink.download = generatedFileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

 

  return (
    <ContainerWrap>
      <section
        ref={pdfComponentRef}
        className="first-screen-window"
        style={{ width: '100%', height: '100vh', justifyContent: 'space-between'}}
      >
        <div className="login-page-logo">
          <img src={logoImg}></img>
        </div>

        <section className="login-screen-window">
          <div className="login-screen-title">
            <div className="fs-title-text">Select a User</div>
          </div>

       

          <UserTabsWrapper onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div className="user-wrapper">
              {userList.map((user, index) => (
                <UserTab
                  key={index}
                  className={selectedIndex == index ? 'fs-user-tab selected' : 'fs-user-tab'}
                  onClick={() => setSelectedIndex(index)}
                  style={{
                    transform: `translateX(${(selectedIndex - index) * -320}px)`,
                  }}
                >
                  <div className="user-tab-img">
                    <img style={{ width: '100%', height: '100%' }} src={user['imageSrc']}></img>
                  </div>
                  {/* <div className="login-user-name">
                 <div className="user-name-text">{user['userName']}</div>
                </div> */}
                  {/* userName inside the tab */}
                </UserTab>
              ))}
            </div>
          </UserTabsWrapper>

          {/* userName outside of the tab */}
          <div className="login-user-name">
            <div id="user-name-container" className="user-name-container">
              {selectedUser && (
                <div className="user-name-text" id="user-name">
                  {selectedUser['userName']}
                </div>
              )}
            </div>
            <div className="user-role">
              {selectedUser && (
                <div className="user-role" id="user-name">
                  {selectedUser['userRole']}
                </div>
              )}
            </div>
          </div>

          <div className="login-buttons-wrapper">
            <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
              <div className="fs-btn-wrapper" style={{ marginRight: '10px' }}>
                <div
                  className={`btn-wrap ${selectedIndex === 0 ? 'disabled' : ''}`}
                  onClick={() => {
                    if (selectedIndex !== 0) {
                      userBack()
                    }
                  }}
                >
                  <div className="select-btn">
                    <img src={selectBtn} style={{ rotate: '180deg' }}></img>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
              <div className="fs-btn-wrapper">
                <div
                  className={`btn-wrap ${selectedIndex === userList.length - 1 ? 'disabled' : ''}`}
                  onClick={() => {
                    if (selectedIndex !== userList.length - 1) {
                      userNext()
                    }
                  }}
                >
                  <div className="select-btn">
                    <img src={selectBtn}></img>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {selectedIndex != -1 && (
          <div className="password-input-wrap" style={{ width: '15%', alignSelf: 'center' }}>
            <div className="password-input" style={{ width: '100%' }}>
              <input
                className="borrow-input-field"
                type="password"
                placeholder="Password"
                ref={passwordInputRef}
                onChange={(event) => {
                  setPassword(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    next()
                  }
                }}
              ></input>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'center',
            marginBottom: '50px',
          }}
        >
          <div className="login-btn-wrapper">
            <div
              className="login-btn-wrap"
              onClick={() => {
                next()
              }}
            >
              <div className="next-btn">{'Log in'}</div>
              {/* <div className="login-btn">
                  <img src={sendBtn}></img>
                </div> */}
            </div>
          </div>
        </div>
        {/* <div className="login-btn-wrapper">
          <div
            className="login-btn-wrap"
            onClick={() => {

              handlePrint()
            }}
          >
            <div className="next-btn">{'Download PDF'}</div>
          </div>
        </div> */}
        <div className="footer-wrapper">
          <div className="footer-text">Powered by</div>
          <div className="footer-img">
            <img src={FooterLogo}></img>
          </div>
        </div>
      </section>

      {/* Ant Design Modal for PDF Preview */}
      {/* Ant Design Modal for PDF Preview */}
      <Modal
        title="PDF Preview"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
          <Button key="download" type="primary" onClick={() => {
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = fileName; // Use formatted filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            Download PDF
          </Button>,
        ]}
        width={800} // Set modal width
      >
        {/* Show Filename */}
        <div>Filename: {fileName}</div>

        {/* Show PDF in Modal using <iframe> */}
        {pdfUrl && (
          <iframe src={pdfUrl} style={{ width: "100%", height: "500px", border: "none" }} title="PDF Preview"></iframe>
        )}
      </Modal>
    </ContainerWrap>
  )
}
