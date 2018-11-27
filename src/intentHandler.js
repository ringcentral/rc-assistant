import * as R from 'ramda'

import rc from './ringcentral'
import { formatObj } from './util'

export const handleIntent = async (intent, event) => {
  switch (intent.intentName) {
    case 'PresenceInfo':
      await handlePresenceInfo(intent, event)
      break
    default:
      const { bot, group } = event
      await bot.sendMessage(group.id, { text: "Sorry, I don't understand" })
      break
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
