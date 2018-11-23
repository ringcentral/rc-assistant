import RingCentral from 'ringcentral-js-concise'

const rc = new RingCentral(
  process.env.RINGCENTRAL_APP_CLIENT_ID,
  process.env.RINGCENTRAL_APP_CLIENT_SECRET,
  process.env.RINGCENTRAL_SERVER
)

export default rc
