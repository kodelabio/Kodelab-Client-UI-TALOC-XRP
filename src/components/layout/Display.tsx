import { ReactNode } from 'react'

export const Display = ({
  children,
  show,
  hold = true,
  className,
}: {
  children: ReactNode
  show: boolean
  hold?: boolean
  className?: string
}) => {
  if (show) {
    if (hold) {
      return <div className={className}>{children}</div>
    } else {
      return <>{children}</>
    }
  } else {
    if (hold) {
      return (
        <div className={className} style={{ display: 'none' }}>
          {children}
        </div>
      )
    } else {
      return <></>
    }
  }
}
