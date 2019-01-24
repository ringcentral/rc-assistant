import axios from 'axios'

import app from './app'

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000')
})

setInterval(() => axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/admin/maintain`), 86400000)
