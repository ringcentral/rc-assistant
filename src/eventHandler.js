import { Service } from 'ringcentral-chatbot/dist/models'
import Lexruntime from 'aws-sdk/clients/lexruntime'

import rc from './ringcentral'
import { handleIntent } from './intentHandler'

const lexruntime = new Lexruntime({ region: process.env.AWS_REGION })

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
  const { group, bot, text, userId } = event
  const service = await Service.findOne({ where: {
    name: 'RingCentral', botId: bot.id, groupId: group.id
  } })
  if (!service) {
    await sendAuthorizationLink(group, bot)
    return
  }
  const intent = await lexruntime.postText({
    botAlias: process.env.AWS_LEX_BOT_NAME,
    botName: process.env.AWS_LEX_BOT_ALIAS,
    inputText: text,
    userId: `${group.id}:${bot.id}:${userId}`
  }).promise()
  try {
    await handleIntent(intent, event)
  } catch (e) {
    if (e.status === 400 && /token/i.test(e.data.error_description)) { // refresh token invalid
      await bot.sendMessage(group.id, { text: `I had been authorized to access RingCentral account, however it is expired/revoked.` })
      await sendAuthorizationLink(group, bot)
      await service.destroy()
      return
    }
    throw e
  }
}
