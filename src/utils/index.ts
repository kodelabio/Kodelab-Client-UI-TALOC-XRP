import { Modal } from 'antd'
import Web3 from 'web3'

let loadingInstance: ReturnType<typeof Modal.info> | undefined

export const showLoading = (content = 'In progress...') => {
  if (loadingInstance) {
    loadingInstance.destroy()
  }
  loadingInstance = Modal.info({
    content,
    maskClosable: false,
    transitionName: '',
    wrapClassName: 'global-loading',
  })
}

export const hideLoading = () => {
  loadingInstance?.destroy()
}

export const scrollTo = (y: number, el: HTMLElement | Window = window) => {
  el.scrollTo({
    top: y,
    behavior: 'smooth',
  })
}

export const scrollToElement = (el: HTMLElement | string) => {
  if (typeof el === 'string') {
    el = document.querySelector(el) as HTMLElement
  }
  window.scrollTo({
    top: getOffsetTop(el),
    behavior: 'smooth',
  })
}

export const getScrollParent = (
  el: HTMLElement | null,
  root: Window | HTMLElement | undefined = window,
) => {
  let node = el

  while (node && node !== root && node.nodeType === 1) {
    const { overflowY } = window.getComputedStyle(node)
    if (/scroll|auto/i.test(overflowY)) {
      return node
    }
    node = node.parentNode as HTMLElement
  }

  return root
}

export const isHidden = (el: HTMLElement | null) => {
  if (!el) {
    return false
  }

  const style = window.getComputedStyle(el)
  const hidden = style.display === 'none'
  const parentHidden = el.offsetParent === null && style.position !== 'fixed'

  return hidden || parentHidden
}

export const deepClone = (obj: object) => {
  return JSON.parse(JSON.stringify(obj))
}

export const getOffsetTop = (el: HTMLElement | null) => {
  let top = 0
  while (el) {
    top += el.offsetTop
    el = el.offsetParent as HTMLElement | null
  }
  return top
}

export const simpleAddress = (address: string, length = 6) => {
  return `${address.substring(0, length)}...${address.substr(-length)}`
}

export const uniqueId = (() => {
  let currentId = 0
  const map = new WeakMap()

  return (object: any) => {
    if (!map.has(object)) {
      map.set(object, ++currentId)
    }

    return map.get(object)
  }
})()

export const fromWei = (amount: string) => {
  if (!amount) return '- -'
  return Web3.utils.fromWei(amount)
}

export const toWei = (amount: string) => {
  if (!amount) return '- -'
  return Web3.utils.toWei(amount)
}

export const toDouble = (num: number) => {
  if (num < 10) {
    return '0' + num
  }
  return num
}
