import { BsArrowLeft, BsArrowLeftShort } from 'react-icons/bs'
import { useNavigate } from 'react-router'
import { ArrowLeftOutlined, LeftOutlined } from '@ant-design/icons'
import styled from 'styled-components/macro'

const BackWrap = styled.div`
  display: flex;
  align-items: center;
  font-size: 15px;
  span:hover {
    text-decoration: underline;
  }
`

export function Back() {
  const navigate = useNavigate()
  return (
    <BackWrap className="cgreen pointer" onClick={() => navigate(-1)}>
      <BsArrowLeftShort size={34} />
      {/* Back */}
    </BackWrap>
  )
}
