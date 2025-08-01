import moment from 'moment'

export const format_num = (num: string | number | undefined, n = 4) => {
  const value = parseFloat(String(num))
  let str = ''
  if (value) {
    const index = String(value).indexOf('.')
    if (index > 0) {
      const arr = String(value).split('.')
      if (arr[1].length >= n) {
        str = `${arr[0]}.${arr[1].slice(0, n)}`
      } else {
        str = value.toFixed(n)
      }
    } else {
      str = value.toFixed(n)
    }
    return str
  } else {
    return `0.${'0'.repeat(n)}`
  }
}

export const format_time = (time: string | number | undefined, format = 'MM/DD/YYYY HH:mm') => {
  if (time) {
    if (typeof time === 'string') {
      if (time.includes('-')) {
        time = time.replace(/-/g, '/')
      }
      time = +new Date(time)
    } else if (String(time).length <= 10) {
      time *= 1000
    }
    const timeOffset = new Date().getTimezoneOffset() * -1 * 60 * 1000
    return moment(new Date(time - timeOffset)).format(format)
  } else {
    return '- -'
  }
}
