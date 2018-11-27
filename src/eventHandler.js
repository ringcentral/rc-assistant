import { Service } from 'ringcentral-chatbot/dist/models'

import rc from './ringcentral'

export const handle = async event => {
  console.log(event.type, 'event')
  switch (event.type) {
    case 'Message4Bot':
      await handleMessage4Bot(event)
      break
    case 'GroupJoined': // bot user joined a new group
      break
    default:
      break
  }
}

const sendAuthorizationLink = async (group, bot) => {
  const authorizeUri = rc.authorizeUri(process.env.RINGCENTRAL_CHATBOT_SERVER + '/rc/oauth',
    { state: `${group.id}:${bot.id}` })
  await bot.sendMessage(group.id, {
    text: `Please [click here](${authorizeUri}) to authorize me to access your RingCentral data.`
  })
}

const handleMessage4Bot = async event => {
  const { group, bot } = event
  const service = await Service.findOne({ where: {
    name: 'RingCentral', botId: bot.id, groupId: group.id
  } })
  if (!service) {
    await sendAuthorizationLink(group, bot)
    return
  }
  try {
    // fetch data onbehalf of user
  } catch (e) {
    if (e.status === 400) { // refresh toke expired
      await bot.sendMessage(group.id, { text: `I had been authorized to access RingCentral account, however it is expired/revoked.` })
      await sendAuthorizationLink(group, bot)
      await service.destroy()
      return
    }
    throw e
  }
}
