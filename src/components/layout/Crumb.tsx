import { useNavigate } from 'react-router'
import { RightOutlined } from '@ant-design/icons'

export default ({ arr }: { arr: string[] }) => {
  const router = useNavigate()
  return (
    <div className="mb-20">
      {arr.map((item, index) => (
        <span key={index}>
          {index !== arr.length - 1 ? (
            <>
              <i className="c-999 pointer" onClick={() => router(index + 1 - arr.length)}>
                {item}
              </i>
              <RightOutlined className="mlr-10" />
            </>
          ) : (
            item
          )}
        </span>
      ))}
    </div>
  )
}
