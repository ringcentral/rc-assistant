/* eslint-env jest */
import Lexruntime from 'aws-sdk/clients/lexruntime'

jest.setTimeout(16000)

const lexruntime = new Lexruntime({ region: 'us-east-1' })

const getIntent = async inputText => {
  const data = await lexruntime.postText({
    botAlias: 'GlipBot',
    botName: 'GlipBot',
    inputText,
    userId: '123456',
    sessionAttributes: {
      hello: '111'
    }
  }).promise()
  console.log(data)
  return data.intentName
}

describe('AWS Lex', () => {
  test('presence info', async () => {
    const intentName = await getIntent('presence info')
    expect(intentName).toEqual('PresenceInfo')
  })
  test('company information', async () => {
    const intentName = await getIntent('company information')
    expect(intentName).toEqual('CompanyInfo')
  })
  test('company info', async () => {
    const intentName = await getIntent('company info')
    expect(intentName).toEqual('CompanyInfo')
  })
})
