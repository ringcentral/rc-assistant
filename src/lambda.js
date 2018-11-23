import serverlessHTTP from 'serverless-http'
import { createAsyncProxy } from 'ringcentral-chatbot/dist/lambda'
import axios from 'axios'

import app from './app'

module.exports.app = serverlessHTTP(app)

module.exports.proxy = createAsyncProxy('app')

module.exports.maintain = async () => axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/admin/maintain`)
