import axios from 'axios'

import app from './app'

app.listen(process.env.RINGCENTRAL_CHATBOT_EXPRESS_PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.RINGCENTRAL_CHATBOT_EXPRESS_PORT}`)
})

setInterval(() => {
  axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/admin/maintain`, undefined, { auth: {
    username: process.env.RINGCENTRAL_CHATBOT_ADMIN_USERNAME,
    password: process.env.RINGCENTRAL_CHATBOT_ADMIN_PASSWORD
  } })
  axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/ringcentral/refresh-tokens`)
}, 86400000)
