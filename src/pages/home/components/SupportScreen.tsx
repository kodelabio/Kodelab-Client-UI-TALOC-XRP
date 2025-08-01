import Column from 'antd/lib/table/Column'
import { StepComponentsProps } from '../CreateVault'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
 import SendBtnIconWhite from '@/assets/icons/supportSend.svg'
import SendBtnIcon from '@/assets/icons/supportSendBlue.svg'
import SupportImg from '@img/supportImage.png'
import axios from 'axios'
import Card from '@/components/Card'
import Property from '@/components/PropertyCard'
import BalanceCard from '@/components/layout/BalanceCard'
import ChartCard from '@/components/layout/ChartCard'
import { getWrapHolder } from '@/hooks/useCdpNft'
import useProxy from '@/hooks/useProxy'
import useTokenAllowance from '@/hooks/useTokenAllowance'
import useUserMangement from '@/hooks/useUserMangement'
import FooterLogo from '@/assets/img/logo-kodelab-footer.png'


let VITE_LUCY_BASE_PATH = import.meta.env.VITE_LUCY_BASE_PATH
let VITE_LUCY_API_KEY = import.meta.env.VITE_LUCY_API_KEY
let VITE_SHARE_KEY = import.meta.env.VITE_SHARE_KEY


const SupportScreen = () => {
  let dummyArray: any[] | (() => any[]) = []

  const [messages, setMessages] = useState([])

  const [propertyList, setPropertyList] = useState(dummyArray)

  const router = useNavigate()

  const { user, checkLogin } = useUserMangement()

  // useEffect(() => {
  //   checkLogin()
  // }, [])

  const messageType = { answer: 'answer', question: 'question' }

  const [msg, setMsg] = useState('')

  const sendRequest = async () => {
    if(msg.trim() === ""){
      return;
    }
     let demo = [
      ...messages,
      {
        type: messageType.question,
        content: msg,
      },
    ]
    setMessages(demo)
    var data = JSON.stringify({
      prompt: demo,
    })

    // var data = JSON.stringify({
    //   "pr": "12",
    //   "prompt": {
    //     "type": messageType.question,
    //     "content": messages[messages.length - 1].content,
    //   }
    // });
   
    var config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: VITE_LUCY_BASE_PATH+'/guestchat/'+VITE_SHARE_KEY,
      headers: {
        'api-key': VITE_LUCY_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'share-key': VITE_SHARE_KEY,
      },
      data: data,
    }

    let response = await axios(config)
      .then(function (response) {
         return response.data
      })
      .catch(function (error) {
        return {
          status: 'false',
          msg: 'Something went wrong',
        }
      })

    if (response.status == 'true') {
      let data = response.data.answer
      let regexURL = /https?:\/\/[^\s]+/g
      let regexMultipleBr = /<br\s*\/?>\s*(<br\s*\/?>)+/gi

      let html = '<a href="$&" style="color: blue;" target="_blank" >$&</a><br />'
      let result = data.replace(regexURL, html)
      ;(result = result.replaceAll('\n', '<br />')),
        (result = result.replace(regexMultipleBr, '<br />'))

      let messagesD = [
        ...demo,
        {
          type: messageType.answer,
          content: result,
        },
      ]

      setMessages(messagesD)
    }
  }

  // useEffect(() => {

  //   let propertyList = getVaultPropertyList(1)

  //   setProperty(propertyList[0])

  // }, [property])

  return (
    <div className="approve-manager">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="chat-window" style={{ width: '75%' }}>
          {/* <!-- Message Body  --> */}

          {messages.length > 0 && (
            <div id="messageBody" style={{ display: 'flex', overflow: 'auto', height: '100%' }}>
              <div style={{ width: '100%' }}>
                <div
                  className="messageBox"
                  id="out"
                  style={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'end',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ marginTop: '10px', display: 'flex' }}>
                    <div
                      style={{
                        marginTop: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                      }}
                    >
                      {messages.map((msg, index) =>
                        msg['type'] === messageType.answer ? (
                          <div className="chatCol messgaeCard-wrap">
                            <img
                              src={SupportImg}
                              style={{ marginRight: '10px' }}
                              alt=""
                              className="logo-1"
                            ></img>
                            <div className="chatCol messgaeCard" style={{ alignItems: 'start' }}>
                              <div style={{ overflow: 'overlay' }}> {msg['content']}</div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="chatCol messgae-card-user"
                            style={{ display: 'flex', alignSelf: 'end', marginTop: '10px' }}
                          >
                            <div style={{ overflow: 'overlay' }}> {msg['content']}</div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* <!-- Empty  --> */}
          {!(messages.length > 0) && (
            <div className="messageBox">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'auto',
                  height: '45vh',
                }}
              >
                <img src={SupportImg} alt="" className="logo-animation" />

                {/* <img :src="this.selectedAvatar.bot_avatar" class="logo-animation"

              v-if="!isLucy && (this.selectedAvatar.bot_animation == '')" />

            <video autoplay loop :src="this.selectedAvatar.bot_animation" class="logo-animation"

              v-if="!isLucy && !(this.selectedAvatar.bot_animation == '')"></video> */}
              </div>

              <div className="titleLucy">
                <p>Hey there, I'm Lily. Feel free to chat with me - I'm more than happy to help!</p>
              </div>
            </div>
          )}

          {/* // <!-- Input Window --> */}

          <div className="input-wrapper" style={{ display: 'flex', flexDirection: 'row', position:'relative', marginBottom:'30px'}}>
            <div className="inputBox">
              <div className="col">
                <div className="text-area">
                  <div className="textarea-box">
                    <textarea
                      className="textarea"
                      placeholder="Hello there!"
                      value={msg}
                      onKeyDown={(e) => {
                        if (e.keyCode == 13 && e.shiftKey == false) {
                          e.preventDefault();
                          sendRequest()
                          setMsg('')
                        }
                      }}
                      onChange={(event) => {
                        setMsg(event.target.value)
                        // console.log(event.target.value)
                      }}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-button">
              <img
                src={SendBtnIcon}
                alt=""
                onClick={() => {
                  sendRequest()
                  setMsg('')
                }}
                className="img-button"
              ></img>
            </div>

            {/* <div className="chat-button" style={{backgroundColor: '#00A29D'}}>

            <img src={SendBtnIconWhite} alt="" className="img-button"></img>

          </div> */}
           
          
          </div>
          
        </div>
        
      </div>
      <div className="mob-footer-wrapper">
                  <div className="footer-text">Powered by</div>
                  <div className="footer-img">
                    <img src={FooterLogo}></img>
                  </div>
                </div>
    </div>
  )
}

export default SupportScreen
