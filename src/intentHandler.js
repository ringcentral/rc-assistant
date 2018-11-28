import * as R from 'ramda'

import rc from './ringcentral'
import { formatObj, sendAuthorizationLink } from './util'

export const handleIntent = async (intent, event, service) => {
  console.log(JSON.stringify(intent, null, 2))
  const { bot, group } = event
  try {
    switch (intent.intentName) {
      case 'PresenceInfo':
        await handlePresenceInfo(intent, event, service)
        break
      case null:
        await bot.sendMessage(group.id, { text: intent.message })
        break
      default:
        throw new Error(`Unhandled intent: ${intent.intentName}`)
    }
  } catch (e) {
    if (/\btoken\b/i.test(e.data.message)) { // refresh token invalid
      await bot.sendMessage(group.id, { text: `I had been authorized to access RingCentral account, however it is expired/revoked.` })
      await sendAuthorizationLink(group, bot)
      await service.destroy()
      return
    }
    throw e
  }
}

const handlePresenceInfo = async (intent, event, service) => {
  rc.token(service.data.token)
  const r = await rc.get('/restapi/v1.0/account/~/extension/~/presence', {
    params: {
      detailedTelephonyState: true,
      sipData: false
    }
  })
  const dl = formatObj(R.pick([
    'presenceStatus',
    'telephonyStatus',
    'userStatus',
    'dndStatus',
    'ringOnMonitoredCall',
    'pickUpCallsOnHold'
  ], r.data))
  const { bot, group } = event
  await bot.sendMessage(group.id, { text: dl })
}
