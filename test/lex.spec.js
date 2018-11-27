/* eslint-env jest */
import Lexruntime from 'aws-sdk/clients/lexruntime'

jest.setTimeout(16000)

const lexruntime = new Lexruntime({ region: 'us-east-1' })

describe('AWS Lex', () => {
  test('default', async () => {
    const data = await lexruntime.postText({
      botAlias: 'GlipBot',
      botName: 'GlipBot',
      inputText: 'presence info',
      userId: '123456',
      sessionAttributes: {
        hello: '111'
      }
    }).promise()
    expect(data).toEqual({
      intentName: 'PresenceInfo',
      slots: {},
      message: null,
      messageFormat: null,
      dialogState: 'ReadyForFulfillment',
      slotToElicit: null,
      sessionAttributes: {
        hello: '111'
      }
    })
  })
})
