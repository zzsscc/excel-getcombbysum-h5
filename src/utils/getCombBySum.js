/**
 * @description: get combination from array
 * @param {Array} arr target array
 * @param {Number} num combination item length
 * @success: {Array} one array that contain combination arrays
 */
export const getCombination = (arr, num) => {
  const r = []
  const fun = (t, a, n) => {
    if (n === 0) {
      return r.push(t)
    }
    for (let i = 0; i <= a.length - n; i += 1) {
      fun(t.concat(a[i]), a.slice(i + 1), n - 1)
    }
  }
  fun([], arr, num)
  return r
}

/**
 * @description: take array index to a array
 * @param {Array} arr target array
 * @success: {Array} one array that include array index
 */
export const getArrayIndex = arr => {
  const r = []
  arr.forEach((d, i) => {
    r.push(i)
  })
  return r
}

/**
 * @description: sort the array, then get what's we need
 * @param {Array} arr target array
 * @param {Number} sum terget sum
 * @success: {Array} one array that include less than sum and sort
 */
export const init = (arr, sum) => {
  // clone array
  const _array = arr.concat()
  const r = []
  // sort by asc
  _array.sort((a, b) => a - b)
  // get all number when it's less than or equal target
  for (let i = 0; i < _array.length; i += 1) {
    if (_array[i] <= sum) {
      r.push(_array[i])
    } else {
      break
    }
  }
  return r
}

/**
 * @description: 调用函数
 * @param {Array} arr target array
 * @param {Number} sum terget sum
 * @param {Number} targetCount 操作数数量。如果不指定此参数默认为0，则结果包含所有可能的情况，指定此参数可以筛选出固定数量的数相加，假如指定为3，那么结果只包含三个数相加的情况。可选。
 * @param {Number} tolerance 容差，如果不指定此参数默认为0，则相加的和必须等于sum参数，指定此参数可以使结果在容差范围内浮动。可选。
 * @success: {Array[Array]} 内层数组中的元素是操作数，外层数组中的元素是所有可能的结果
 */
const getCombBySum = function (array, sum, targetCount = 0, tolerance = 0) {
  return new Promise(async resolve => {
    this.r = []
    this._array = []
    this._targetCount = 0
    this._tolerance = 0
    this._returnMark = 0

    // check data
    this._targetCount = targetCount || this._targetCount
    this._tolerance = tolerance || this._tolerance

    this._array = init(array, sum)
    if (this._targetCount) {
      this._returnMark = this._targetCount - 1
    }

    // important function
    this.core = async (arr, target, arrayIndex, count, r) => {
      return new Promise(async resolve => {
        let combArray = []
        let _sum = 0
        let _cca = []
        let _cache = []

        if (count === this._returnMark) {
          resolve()
          return
        }
        // get current count combination
        combArray = getCombination(arrayIndex, count);
        for (let i = 0; i < combArray.length; i += 1) {
          _cca = combArray[i]
          _sum = 0
          _cache = []
          // calculate the target from combination
          for (let k = 0; k < _cca.length; k += 1) {
            _sum += arr[_cca[k]]
            _cache.push(arr[_cca[k]])
          }
          if (Math.abs(_sum - target) <= this._tolerance) {
            r.push(_cache)
            break
          }
        }

        await this.core(arr, target, arrayIndex, count - 1, r)
      })
    }

    this.core(this._array, sum, getArrayIndex(this._array), (this._targetCount || this._array.length), this.r)

    resolve(this.r)
    return this.r
  })
}

export default getCombBySum
