import * as R from 'ramda'

import rc from './ringcentral'
import { formatObj, sendAuthorizationLink } from './util'

export const handleIntent = async (intent, event, service) => {
  console.log(JSON.stringify(intent, null, 2))
  const { bot, group } = event
  if (intent.dialogState === 'ElicitIntent' || intent.dialogState === 'Failed') {
    return bot.sendMessage(group.id, { text: intent.message })
  }

  switch (intent.intentName) {
    case 'Hello':
      return handleHello(intent, event)
    default:
      break
  }

  // before are services which don't need rc token
  // after are services which do need rc token

  if (!service) {
    return sendAuthorizationLink(group, bot)
  }

  try {
    switch (intent.intentName) {
      case 'PresenceInfo':
        await handlePresenceInfo(intent, event, service)
        break
      default:
        throw new Error(`Unhandled intent: ${intent.intentName}`)
    }
  } catch (e) {
    if (e.data && /\btoken\b/i.test(e.data.message)) { // refresh token invalid
      await bot.sendMessage(group.id, { text: `I had been authorized to access RingCentral account, however it is expired/revoked.` })
      await sendAuthorizationLink(group, bot)
      await service.destroy()
    }
    throw e
  }
}

const handleHello = async (intent, event) => {
  const { bot, group, userId } = event
  let helloMessage = `
Hello ![:Person](${userId}), I am ![:Person](${bot.id}). I can help you with the following:
* **View your company information** like billing plan, service plane, business hours etc.
* **View/edit your personal information** like personal information, business hours, services available etc.
* **View/edit your notification settings** for Voicemails, Texts and Fax
* **View your presence information and Edit Do Not Disturb and User Status**
* **View/edit your caller ID settings** for available features
If you would like see more detailed information about any of the functions above, please ask.
`.trim()
  await bot.sendMessage(group.id, { text: helloMessage })
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
