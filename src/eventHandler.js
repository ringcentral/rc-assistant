import { Service } from 'ringcentral-chatbot/dist/models'
import Lexruntime from 'aws-sdk/clients/lexruntime'

import { handleIntent, handleHello } from './intentHandler'

const lexruntime = new Lexruntime({ region: process.env.AWS_REGION })

export const handle = async event => {
  console.log(event.type, 'event')
  switch (event.type) {
    case 'Message4Bot':
      await handleMessage4Bot(event)
      break
    case 'GroupJoined': // bot user joined a new group
      await handleHello(undefined, event)
      break
    default:
      break
  }
}

const handleMessage4Bot = async event => {
  const { group, bot, text, userId } = event
  const service = await Service.findOne({ where: {
    name: 'RingCentral', botId: bot.id, groupId: group.id
  } })
  const intent = await lexruntime.postText({
    botAlias: process.env.AWS_LEX_BOT_NAME,
    botName: process.env.AWS_LEX_BOT_ALIAS,
    inputText: text,
    userId: `${group.id}:${bot.id}:${userId}`
  }).promise()
  await handleIntent(intent, event, service)
}
