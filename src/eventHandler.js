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

const handleMessage4Bot = async event => {
  const { group, bot } = event
  const service = await Service.findOne({ where: {
    name: 'RingCentral', botId: bot.id, groupId: group.id
  } })
  if (!service) {
    const authorizeUri = rc.authorizeUri(process.env.RINGCENTRAL_CHATBOT_SERVER + '/rc/oauth',
      { state: `${group.id}:${bot.id}` })
    await bot.sendMessage(group.id, { text: `Please [authorize me to access your RingCentral data](${authorizeUri}).` })
    return
  }
  await bot.sendMessage(group.id, { text: 'Hi, I am here' })
}
