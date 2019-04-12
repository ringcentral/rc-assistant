import * as R from 'ramda'

import rc from './ringcentral'

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

export const sendAuthorizationLink = async (group, bot) => {
  const authorizeUri = rc.authorizeUri(process.env.RINGCENTRAL_CHATBOT_SERVER + '/rc/oauth',
    { state: `${group.id}:${bot.id}` })
  await bot.sendMessage(group.id, {
    text: `Please [click here](${authorizeUri}) to authorize me to access your RingCentral data.`
  })
}

export const cartesianProduct = (...arrays) => {
  if (arrays.length === 1) {
    return arrays[0]
  }
  return cartesianProduct(
    R.xprod(arrays[0], arrays[1]).map(items => R.join(' ', items).trim()),
    ...R.slice(2, Infinity, arrays)
  )
}
