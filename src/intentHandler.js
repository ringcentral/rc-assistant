import * as R from 'ramda'

import rc from './ringcentral'
import { formatObj, sendAuthorizationLink } from './util'

export const handleIntent = async (intent, event, service) => {
  console.log(JSON.stringify(intent, null, 2))
  const { bot, group } = event
  if (intent.dialogState === 'ElicitSlot' || intent.dialogState === 'ElicitIntent' || intent.dialogState === 'Failed') {
    return bot.sendMessage(group.id, { text: intent.message.replace(/\\n/g, '\n') })
  }

  if (intent.dialogState !== 'ReadyForFulfillment') {
    throw new Error(`unexpected intent dialogState: ${intent.dialogState}`)
  }

  switch (intent.intentName) {
    case 'Hello':
      return handleHello(intent, event)
    case 'Help':
      return handleHelp(intent, event)
    case 'EditPersonalInfo':
      return handleEditPersonalInfo(intent, event, service)
    case 'EditCallerID':
      return handleEditCallerID(intent, event, service)
    case 'EditBusinessHours':
      return handleEditBusinessHours(intent, event, service)
    default:
      break
  }

  if (!service) {
    return sendAuthorizationLink(group, bot)
  }

  rc.token(service.data.token)
  const tokenChanged = token => {
    service.update({
      data: {
        id: token.owner_id, token
      }
    })
  }
  rc.on('tokenChanged', tokenChanged)

  try {
    switch (intent.intentName) {
      case 'CompanyInfo':
        await handleCompanyInfo(intent, event, service)
        break
      case 'CompanyServicePlan':
        await handleCompanyServicePlan(intent, event, service)
        break
      case 'CompanyBillingPlan':
        await handleCompanyBillingPlan(intent, event, service)
        break
      case 'CompanyTimeZone':
        await handleCompanyTimeZone(intent, event, service)
        break
      case 'CompanyGreeting':
        await handleCompanyGreeting(intent, event, service)
        break
      case 'PersonalInfo':
        await handlePersonalInfo(intent, event, service)
        break
      case 'BusinessHours':
        await handleBusinessHours(intent, event, service)
        break
      case 'GetServices':
        await handleGetServices(intent, event, service)
        break
      case 'CallerID':
        await handleCallerID(intent, event, service)
        break
      case 'PresenceInfo':
        await handlePresenceInfo(intent, event, service)
        break
      case 'EditUserStatus':
        await handleEditUserStatus(intent, event, service)
        break
      case 'EditDnDStatus':
        await handleEditDnDStatus(intent, event, service)
        break
      case 'NotificationSettings':
        await handleNotificationSettings(intent, event, service)
        break
      default:
        throw new Error(`Unhandled intent: ${intent.intentName}`)
    }
  } catch (e) {
    if (e.data && /\btoken\b/i.test(e.data.message)) { // refresh token invalid
      await bot.sendMessage(group.id, { text: `I had been authorized to access RingCentral account, however it is expired/revoked.` })
      await sendAuthorizationLink(group, bot)
      await service.destroy()
    }
    throw e
  } finally {
    rc.removeListener('tokenChanged', tokenChanged)
  }
}

const handleHello = async (intent, event) => {
  const { bot, group, userId } = event
  let helloMessage = `
Hello ![:Person](${userId}), I am ![:Person](${bot.id}). I can help you with the following:
* **View your company information** like billing plan, service plane, business hours etc.
* **View/edit your personal information** like personal information, business hours, services available etc.
* **View/edit your notification settings** for Voicemails, Texts and Fax
* **View your presence information and Edit Do Not Disturb and User Status**
* **View/edit your caller ID settings** for available features
If you would like see more detailed information about any of the functions above, please ask.
`.trim()
  await bot.sendMessage(group.id, { text: helloMessage })
}

const handleHelp = async (intent, event) => {
  let text = ''
  switch (intent.slots.FeatureGroup) {
    case 'company info':
      text = `
Here is a list of features available for **company information**:
* **View company details** - company id, name, main number and operator extension
* **View company billing plan** - billing id, name, duration unit, duration, type and included phone lines
* **View company service plan** - service ID, name and service edition
* **View company business hours** - operation hours for the entire week
* **View company greeting language** - greeting language, name and local code
* **View company time-zone** - time-zone ID, name, description and bias
`
      break
    case 'personal info':
      text = `
Here is a list of features available for **personal info**:
* **View your personal information** - First and Last Name, Company, Business Phone and Business Hours
* **View business hours** - your business hours for the entire week
* **Edit my business hours**
* **Services available to you** - lists all the RingCentral services that available for you to use
* **Services unavailable to me** - lists all the RingCentral services that are not available for you
* **Edit your personal information** - you can edit your First and Last Name, Business Phone, Business Hourss and Address
`
      break
    case 'notification settings':
      text = `
Here is a list of features available for **notification settings**:
* **View notifications settings** for voicemails, missed calls, fax and texts
* **Enable/Disable email or sms notifications** for voicemails, missed calls, fax and texts
`
      break
    case 'presence info':
      text = `
Here is a list of features available for **presence info**:
* **View your presence info** - lists your Presence, Telephony, User and Do Not Disturb status
* **Change your Do Not Disturb status ** to take all calls or to not accept any calls
* **Set your user status** to Available, Busy or Offline
`
      break
    case 'caller ID info':
      text = `
Here is a list of features available for **Caller ID settings**:
* **View your caller ID settings** for available features
* **Edit caller ID settings**
`
      break
    default:
      break
  }
  const { bot, group } = event
  await bot.sendMessage(group.id, { text: text.trim() })
}

const handleEditPersonalInfo = async (intent, event, service) => {
  const text = `[Click here](${process.env.RINGCENTRAL_SERVICE_WEB_SERVER}/application/settings/settings/extensionInfo/general) to edit your personal information.`
  const { bot, group } = event
  await bot.sendMessage(group.id, { text })
}

const handleEditCallerID = async (intent, event, service) => {
  const text = `[Click here](${process.env.RINGCENTRAL_SERVICE_WEB_SERVER}/application/settings/outboundCallsFaxes/callerId) to edit your caller ID information.`
  const { bot, group } = event
  await bot.sendMessage(group.id, { text })
}

const handleEditBusinessHours = async (intent, event, service) => {
  const text = `[Click here](${process.env.RINGCENTRAL_SERVICE_WEB_SERVER}/application/settings/settings/extensionInfo/settingsAndPermissions) to edit your bussiness hours.`
  const { bot, group } = event
  await bot.sendMessage(group.id, { text })
}

const handleCompanyInfo = async (intent, event, service) => {
  const r = await rc.get('/restapi/v1.0/account/~')
  const obj = {
    brand_id: r.data['serviceInfo']['brand']['id'],
    brand_name: r.data['serviceInfo']['brand']['name'],
    main_number: r.data['mainNumber'],
    operator_extension: r.data['operator']['extensionNumber'],
    home_country: r.data['serviceInfo']['brand']['homeCountry']['name']
  }
  const { bot, group } = event
  await bot.sendMessage(group.id, { text: formatObj(obj) })
}

const handleCompanyServicePlan = async (intent, event, service) => {
  const r = await rc.get('/restapi/v1.0/account/~')
  const obj = {
    service_id: r.data['serviceInfo']['servicePlan']['id'],
    service_name: r.data['serviceInfo']['servicePlan']['name'],
    service_edition: r.data['serviceInfo']['servicePlan']['edition']
  }
  const { bot, group } = event
  await bot.sendMessage(group.id, { text: formatObj(obj) })
}

const handleCompanyBillingPlan = async (intent, event, service) => {
  const r = await rc.get('/restapi/v1.0/account/~')
  const obj = {
    billing_id: r.data['serviceInfo']['billingPlan']['id'],
    billing_name: r.data['serviceInfo']['billingPlan']['name'],
    duration_unit: r.data['serviceInfo']['billingPlan']['durationUnit'],
    duration: r.data['serviceInfo']['billingPlan']['duration'],
    type: r.data['serviceInfo']['billingPlan']['type'],
    included_phone_lines: r.data['serviceInfo']['billingPlan']['includedPhoneLines']
  }
  const { bot, group } = event
  await bot.sendMessage(group.id, { text: formatObj(obj) })
}

const handleCompanyTimeZone = async (intent, event, service) => {
  const r = await rc.get('/restapi/v1.0/account/~')
  const obj = {
    id: r.data['regionalSettings']['timezone']['id'],
    name: r.data['regionalSettings']['timezone']['name'],
    description: r.data['regionalSettings']['timezone']['description'],
    bias: r.data['regionalSettings']['timezone']['bias']
  }
  const { bot, group } = event
  await bot.sendMessage(group.id, { text: formatObj(obj) })
}

const handleCompanyGreeting = async (intent, event, service) => {
  const r = await rc.get('/restapi/v1.0/account/~')
  const obj = {
    id: r.data['regionalSettings']['greetingLanguage']['id'],
    name: r.data['regionalSettings']['greetingLanguage']['name'],
    locale_code: r.data['regionalSettings']['greetingLanguage']['localeCode']
  }
  const { bot, group } = event
  await bot.sendMessage(group.id, { text: formatObj(obj) })
}

const handlePersonalInfo = async (intent, event, service) => {
  const r = await rc.get('/restapi/v1.0/account/~/extension/~')
  const obj = {
    first_name: r.data['contact']['firstName'],
    last_name: r.data['contact']['lastName'],
    email: r.data['contact']['email'],
    company: r.data['contact']['company'],
    businessPhone: r.data['contact']['businessPhone'],
    extensionNumber: r.data['extensionNumber']
  }
  if ('address' in r.data['contact']) {
    obj.address = r.data['contact']['businessAddress']['street'] + '\n\t' +
    r.data['contact']['businessAddress']['city'] + ', ' + r.data['contact']['businessAddress']['state'] + '\n\t' +
    r.data['contact']['businessAddress']['country'] + ' ' + r.data['contact']['businessAddress']['zip']
  }
  const { bot, group } = event
  await bot.sendMessage(group.id, { text: formatObj(obj) })
}

const handleBusinessHours = async (intent, event, service) => {
  let r
  if (intent.slots.HoursFor === 'personal') {
    r = await rc.get('/restapi/v1.0/account/~/extension/~/business-hours')
  } else if (intent.slots.HoursFor === 'company') {
    r = await rc.get('/restapi/v1.0/account/~/business-hours')
  }
  console.log(r.data)
  let table = '|**Day**|**From**|**To**|\n'
  const schedule = r.data['schedule']
  if (R.isEmpty(schedule)) {
    table = 'Provide 24/7 service'
  } else {
    const weeklyRanges = schedule['weeklyRanges']
    if ('monday' in weeklyRanges) {
      table = table + '|Monday|' + weeklyRanges['monday'][0]['from'] + '|' + weeklyRanges['monday'][0]['to'] + '|\n'
    }
    if ('tuesday' in weeklyRanges) {
      table = table + '|Tuesday|' + weeklyRanges['tuesday'][0]['from'] + '|' + weeklyRanges['tuesday'][0]['to'] + '|\n'
    }
    if ('wednesday' in weeklyRanges) {
      table = table + '|Wednesday|' + weeklyRanges['wednesday'][0]['from'] + '|' + weeklyRanges['wednesday'][0]['to'] + '|\n'
    }
    if ('thursday' in weeklyRanges) {
      table = table + '|Thursday|' + weeklyRanges['thursday'][0]['from'] + '|' + weeklyRanges['thursday'][0]['to'] + '|\n'
    }
    if ('friday' in weeklyRanges) {
      table = table + '|Friday|' + weeklyRanges['friday'][0]['from'] + '|' + weeklyRanges['friday'][0]['to'] + '|\n'
    }
    if ('saturday' in weeklyRanges) {
      table = table + '|Saturday|' + weeklyRanges['saturday'][0]['from'] + '|' + weeklyRanges['saturday'][0]['to'] + '|\n'
    }
    if ('sunday' in weeklyRanges) {
      table = table + '|Sunday|' + weeklyRanges['sunday'][0]['from'] + '|' + weeklyRanges['sunday'][0]['to'] + '|\n'
    }
  }
  const { bot, group } = event
  await bot.sendMessage(group.id, { text: table })
}

const handleGetServices = async (intent, event, service) => {
  const r = await rc.get('/restapi/v1.0/account/~/extension/~')
  const serviceFeatures = r.data.serviceFeatures

  const serviceType = intent.slots.ServiceType
  let text
  if (serviceType === 'available') {
    text = serviceFeatures.filter(sf => sf.enabled).map(sf => sf.featureName).join(', ')
  } else if (serviceType === 'unavailable') {
    text = '|**Feature Name**|**Reason**|\n' +
      serviceFeatures.filter(sf => !sf.enabled).map(sf => `|${sf.featureName}|${sf.reason}|`).join('\n')
  }
  const { bot, group } = event
  await bot.sendMessage(group.id, { text })
}

const handleCallerID = async (intent, event, service) => {
  const r = await rc.get('/restapi/v1.0/account/~/extension/~/caller-id')
  const fields = [{ 'title': 'Feature', 'style': 'Short', 'value': '' }, { 'title': 'Caller ID', 'style': 'Short', 'value': '' }]
  console.log(r.data)
  r.data.byFeature.filter(f => !R.isNil(f.callerId) && !R.isEmpty(f.callerId)).forEach(({ feature, callerId }) => {
    fields.push({ 'title': ' ', 'value': feature, 'style': 'Short' })
    if (callerId['type'] === 'PhoneNumber') {
      fields.push({ 'title': ' ', 'value': callerId['phoneInfo']['phoneNumber'], 'style': 'Short' })
    } else {
      fields.push({ 'title': ' ', 'value': ' ', 'style': 'Short' })
    }
  })
  const { bot, group } = event
  await bot.sendMessage(group.id, {
    text: '',
    'attachments': [{
      'type': 'Card',
      'fallback': "The attachment isn't supported.",
      'color': '#9C1A22',
      'fields': fields
    }]
  })
}

const handlePresenceInfo = async (intent, event, service) => {
  const r = await rc.get('/restapi/v1.0/account/~/extension/~/presence', {
    params: {
      detailedTelephonyState: true,
      sipData: false
    }
  })
  const text = formatObj(R.pick([
    'presenceStatus',
    'telephonyStatus',
    'userStatus',
    'dndStatus',
    'ringOnMonitoredCall',
    'pickUpCallsOnHold'
  ], r.data))
  const { bot, group } = event
  await bot.sendMessage(group.id, { text })
}

const handleEditUserStatus = async (intent, event, service) => {
  const userStatus = intent.slots.UserStatus
  await rc.put('/restapi/v1.0/account/~/extension/~/presence', { userStatus })
  const text = `Successfully changed your user status to: **${userStatus}**`
  const { bot, group } = event
  await bot.sendMessage(group.id, { text })
}

const handleEditDnDStatus = async (intent, event, service) => {
  const dndStatus = intent.slots.DnDStatus
  const r = await rc.put('/restapi/v1.0/account/~/extension/~/presence', { dndStatus })
  console.log(r.data)
  const text = `Successfully changed your Do Not Disturb status to: **${dndStatus}**`
  const { bot, group } = event
  await bot.sendMessage(group.id, { text })
}

const handleNotificationSettings = async (intent, event, service) => {
  const r = await rc.get('/restapi/v1.0/account/~/extension/~/notification-settings')
  const alertsFor = intent.slots.AlertsFor.toLowerCase()
  let text
  switch (alertsFor) {
    case 'voicemail':
      text = formatObj(R.pick(['notifyByEmail', 'notifyBySms', 'includeAttachment', 'markAsRead'], r.data['voicemails']))
      break
    case 'in-fax':
      text = formatObj(R.pick(['notifyByEmail', 'notifyBySms', 'includeAttachment', 'markAsRead'], r.data['inboundFaxes']))
      break
    case 'out-fax':
      text = formatObj(R.pick(['notifyByEmail', 'notifyBySms'], r.data['outboundFaxes']))
      break
    case 'in-text':
      text = formatObj(R.pick(['notifyByEmail', 'notifyBySms'], r.data['inboundTexts']))
      break
    case 'missed call':
      text = formatObj(R.pick(['notifyByEmail', 'notifyBySms'], r.data['missedCalls']))
      break
    default:
      throw new Error('invalid notification alertsFor value: ', alertsFor)
  }
  const { bot, group } = event
  await bot.sendMessage(group.id, { text })
}
