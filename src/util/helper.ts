import { math_div, math_multiply } from './math'

/**
 * 短链接编码和解码 ShortCode
 */
export const ShortCode = {
  Alphabet: 'wB8bEm6cUdxNrhMZoYDTgGp0I4Snv7u13Q5lO2RkzAHjFs9itLeXKJWfaPqVyC',

  /**编码 */
  encode(str: number | string, prefix: string) {
    const Alphabet = ShortCode.Alphabet
    const Base = Alphabet.length
    let num = Number(str)
    if (num == 0) return Alphabet[0]

    let s = ''

    while (num > 0) {
      s = Alphabet[num % Base] + s
      num = Math.floor(num / Base)
    }

    return prefix + s
  },
  /**解码 */
  decode(str: string, prefix = true) {
    const Alphabet = ShortCode.Alphabet
    const Base = Alphabet.length
    let i = 0
    if (prefix) {
      str = str.substring(1)
    }

    for (let c of str) {
      i = i * Base + Alphabet.indexOf(c)
    }

    return i
  },
}

/**响应请求 */
export const HttpResponse = {
  success(data?: any, opt?: { msg?: string; success?: boolean; err?: number }) {
    if (data === null) {
      return HttpResponse.error({}, opt)
    }
    return {
      err: opt?.err ?? 0,
      msg: opt?.msg ?? 'success',
      success: opt?.success ?? true,
      data: data ?? {},
    }
  },
  error(data?: any, opt?: { msg?: string; success?: boolean; err?: number }) {
    return {
      err: opt?.err ?? 1,
      msg: opt?.msg ?? 'error',
      success: opt?.success ?? false,
      data: data ?? {},
    }
  },
}

/**md5加密 */
export const md5 = (content: string) => {
  const crypto = require('crypto')
  const hash = crypto.createHash('md5')
  return hash.update(content).digest('hex') // 把输出编程16进制的格式
}

export const WeiToEth = (amount: number | string, decimals: number) => {
  return math_div(Number(amount), 10 ** decimals)
}
export const EthToWei = (amount: number | string, decimals: number) => {
  return math_multiply(Number(amount), 10 ** decimals)
}

/**创建随机金额 */
function generateNormalRandom(mean: number, standardDeviation: number) {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random() // 确保 u 不为零
  while (v === 0) v = Math.random() // 确保 v 不为零

  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return mean + standardDeviation * z
}

/**创建红包 */
export const RandHongbao = (totalAmount: number, totalPeople: number) => {
  if (totalAmount <= 0 || totalPeople <= 0) {
    throw new Error('无效的红包金额或人数')
  }

  const packets: number[] = []
  const mean = totalAmount / totalPeople
  const standardDeviation = mean / 2 // 调整标准差以控制分布的宽度

  let remainingAmount = totalAmount

  for (let i = 0; i < totalPeople - 1; i++) {
    let amount = generateNormalRandom(mean, standardDeviation)
    amount = Math.max(0.5, amount) // 确保生成的金额不小于0.1
    amount = Math.min(amount, remainingAmount - (totalPeople - i - 1) * 0.1) // 避免生成过大的金额
    amount = Math.round(amount * 100) / 100 // 保留两位小数

    remainingAmount -= amount
    packets.push(amount)
  }

  // 最后一个红包为剩余金额，但不为 0
  // packets.push(Math.max(0.1, remainingAmount));
  packets.push(Number(remainingAmount.toFixed(2)))

  return packets
}
