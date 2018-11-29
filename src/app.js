import createApp from 'ringcentral-chatbot/dist/apps'
import { Service, Bot } from 'ringcentral-chatbot/dist/models'
import * as R from 'ramda'

import { handle } from './eventHandler'
import rc from './ringcentral'
import { formatObj, sendAuthorizationLink } from './util'

const app = createApp(handle)

app.get('/rc/oauth', async (req, res) => {
  const { code, state } = req.query
  const [groupId, botId] = state.split(':')
  await rc.authorize({ code, redirectUri: process.env.RINGCENTRAL_CHATBOT_SERVER + '/rc/oauth' })
  const token = rc.token()
  const query = { name: 'RingCentral', groupId, botId }
  const data = { id: token.owner_id, token }
  const service = await Service.findOne({ where: query })
  if (service) {
    await service.update({ data })
  } else {
    await Service.create({ ...query, data })
  }
  const bot = await Bot.findByPk(botId)
  const r = await rc.get('/restapi/v1.0/account/~/extension/~')
  await bot.sendMessage(groupId, { text: `I have been authorized to fetch data on behalf of the following RingCentral extension:
${formatObj(R.pick(['id', 'extensionNumber', 'type', 'name', 'account', 'uri'], r.data))}` })
  res.send('<!doctype><html><body><script>close()</script></body></html>')
})

app.put('/admin/refresh-tokens', async (req, res) => {
  const services = await Service.findAll()
  for (const service of services) {
    rc.token(service.data.token)
    try {
      await rc.refresh()
    } catch (e) {
      console.error(e)
      if (e.data && /\btoken\b/i.test(e.data.message)) { // refresh token expired
        const bot = await Bot.findByPk(service.botId)
        await bot.sendMessage(service.groupId, { text: 'Authorization expired' })
        await sendAuthorizationLink({ id: service.groupId }, bot)
        await service.destroy()
      }
      continue
    }
    const token = rc.token()
    await service.update({
      data: {
        id: token.owner_id, token
      }
    })
  }
  res.send('')
})

export default app
