import { ConfigProvider } from 'antd'
import 'antd/dist/antd.less'
import './App.less'
import Router from './Router'
import { AppKitProvider } from './providers/Web3Provider'

import { HashRouter } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'


const RouterWrap = styled.div`
`

function App() {
  return (
    <div className="App">
      {/* <ThemeProvider theme={{ primary: '#498fec', mob: '@media screen and (max-width: 768px)' }}> */}
      <AppKitProvider>
        <ConfigProvider componentSize="large">
          <HashRouter>
            {/* <Header /> */}

            <RouterWrap>
              <Router />
            </RouterWrap>
          </HashRouter>
        </ConfigProvider>

      </AppKitProvider>
      {/* </ThemeProvider> */}
    </div>
  )
}

export default App
