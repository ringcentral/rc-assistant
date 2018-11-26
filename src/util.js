import * as R from 'ramda'

export const toPairs = (val, path = []) => {
  if (val === null || typeof val !== 'object') {
    return [{ path, val }]
  }
  return R.pipe(
    R.toPairs,
    R.map(([k, v]) => toPairs(v, [...path, k])),
    R.flatten
  )(val)
}

export const formatObj = obj => {
  return R.pipe(
    R.map(({ path, val }) => `**${path.join(' ')}**: ${val}`),
    R.join('\n')
  )(toPairs(obj))
}
