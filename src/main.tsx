import App from './App'
import store from './store'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import 'virtual:svg-icons-register'
import {ThemeProvider} from '../src/context/ThemeContext'
import '../src/assets/theme/variables/variables_colors.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
     <ThemeProvider>
    <App />
    </ThemeProvider>
  </Provider>,
)
