import createApp from 'ringcentral-chatbot/dist/apps'
import axios from 'axios'

import { handle } from './eventHandler'

const app = createApp(handle)
app.listen(3000)

setInterval(() => axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/admin/maintain`), 86400000)
