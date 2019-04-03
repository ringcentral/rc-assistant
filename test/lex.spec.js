/* eslint-env jest */
import Lexruntime from 'aws-sdk/clients/lexruntime'
import uuid from 'uuid/v1'

jest.setTimeout(64000)

const lexruntime = new Lexruntime({ region: 'us-east-1' })

const getIntent = async inputText => {
  const data = await lexruntime.postText({
    botAlias: 'GlipBot',
    botName: 'GlipBot',
    inputText,
    userId: uuid(),
    sessionAttributes: {
      hello: '111'
    }
  }).promise()
  console.log(data)
  return data
}

describe('AWS Lex', () => {
  test('presence info', async () => {
    const data = await getIntent('presence info')
    expect(data.intentName).toEqual('PresenceInfo')
  })
  test('company information', async () => {
    const data = await getIntent('company information')
    expect(data.intentName).toEqual('CompanyInfo')
  })
  test('company info', async () => {
    const data = await getIntent('company info')
    expect(data.intentName).toEqual('CompanyInfo')
  })
  test('business hour', async () => {
    const data = await getIntent('business hour')
    expect(data.intentName).toEqual('BusinessHours')
    expect(data.slots).toEqual({ HoursFor: null })
  })
})
