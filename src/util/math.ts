import { create, all } from 'mathjs'

const config = {
  epsilon: 1e-12,
  matrix: 'Matrix',
  number: 'BigNumber',
  precision: 64,
  predictable: false,
  randomSeed: null,
}
const math = create(all, config as any) as Required<math.MathJsStatic> // 可选转必选

// console.log(
//   '111[math.add(1.13 - 0.04)]',
//   math.evaluate('1.13 + -0.04') - 0,
//   math.evaluate('2.01 * 100') - 0,
//   math.evaluate('0.1 + 0.2') - 0,
// )

/** match 实现自定义加法 n1 + n2
 * @param n1
 * @param n2
 * @returns
 *
 */
export const math_add = (n1: number, n2: number) => {
  return Number((math.evaluate as any)(`${n1} + ${n2}`))
}

/** match 实现自定义乘法 n1 * n2
 * @param n1
 * @param n2
 * @returns
 */
export const math_multiply = (n1: number, n2: number) => {
  return Number(math.evaluate(`${n1} * ${n2}`))
}

/** match 实现自定义除法 n1 / n2
 * @param n1
 * @param n2
 * @returns
 */
export const math_div = (n1: number, n2: number) => {
  return Number(math.evaluate(`${n1} / ${n2}`))
}

/** match 实现自定义减法 n1 - n2
 * @param n1
 * @param n2
 * @returns
 */
export const math_subtract = (n1: number, n2: number) => {
  return Number(math.evaluate(`${n1} - ${n2}`))
}
