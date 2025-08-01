import '../../../../assets/theme/css/fcaDashboard.css'
import { useLocation, useNavigate } from 'react-router-dom'
import AbuDhabiBank from '@/assets/img/bank/AbuDhabiBank.svg'
import GoldmanSachs from '@/assets/img/bank/goldman-sachs.svg'
import HSBC from '@/assets/img/bank/hsbc-logo.svg'
import Lloyds from '@/assets/img/bank/lloyds-logo.svg'

interface BankCardProps {
  name: string
  logo: string
  isActive: boolean
}

const banks: BankCardProps[] = [
  { name: 'HSBC', logo: HSBC, isActive: false },
  { name: 'Goldman Sachs', logo: GoldmanSachs, isActive: false },
  { name: 'Lloyds', logo: Lloyds, isActive: false },
  { name: 'First Abu Dhabi Bank', logo: AbuDhabiBank, isActive: true },
]
 
const BankCard: React.FC<BankCardProps> = ({ name, logo, isActive }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
    let url = location.pathname

    let path = '/home/view/FCAReports/reports'

    if (url.includes('superadmin')) {
      path = path.replace('view', 'superadmin')
    }

    navigate(`${path}`, { state: { bankName: name } })
  }

  return (
    <div className="bank-card">
      <div className="bank-name">
        <h3>{name}</h3>
      </div>
      <div className="bank-img">
        <img src={logo} alt={name} />
      </div>
      <div className="see-reports" onClick={handleClick}>
        <p>See reports</p>
      </div>
    </div>
  )
}

const FCADashboard: React.FC = () => {
  return (
    <div className="fca-dashboard-container">
      <div className="fca-dashboard-title">
        <h2>Report verification suite</h2>
      </div>
      <div className="bank-grid">
        {banks.map((bank) => (
          <BankCard key={bank.name} {...bank} />
        ))}
      </div>
    </div>
  )
}

export default FCADashboard
