import * as R from 'ramda'

import rc from './ringcentral'
import { formatObj } from './util'

export const handleIntent = async (intent, event) => {
  console.log(JSON.stringify(intent, null, 2))
  const { bot, group } = event
  switch (intent.intentName) {
    case 'PresenceInfo':
      await handlePresenceInfo(intent, event)
      break
    case null:
      await bot.sendMessage(group.id, { text: intent.message })
      break
    default:
      throw new Error(`Unhandled intent: ${intent.intentName}`)
  }
}

const handlePresenceInfo = async (intent, event) => {
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
