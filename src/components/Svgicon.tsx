import { ReactNode } from 'react'

export default ({
  name,
  size = '16',
  gap = 8,
  children,
  className,
}: {
  name: string
  size?: string
  color?: string
  gap?: number
  children?: ReactNode
  className?: string
}) => {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <svg aria-hidden="true" width={size} height={size} className={`svg-icon mr-${gap}`}>
        <use xlinkHref={`#icon-${name}`} />
      </svg>
      {children}
    </span>
  )
}
