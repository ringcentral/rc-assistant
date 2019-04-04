/* eslint-env jest */
import fs from 'fs'

import { generateUtterances } from '../src/generate'

describe('generateUtterances', () => {
  // test('view business hour', () => {
  //   const action = 'view'
  //   const subject = 'business hour'
  //   const slot = 'HoursFor'
  //   var utterances = generateUtterances(action, subject, slot)
  //   console.log(utterances)
  //   expect(utterances).toEqual([ 'business hour',
  //     '{HoursFor} business hour',
  //     'view business hour',
  //     'view {HoursFor} business hour',
  //     'show business hour',
  //     'show {HoursFor} business hour',
  //     'display business hour',
  //     'display {HoursFor} business hour',
  //     'get business hour',
  //     'get {HoursFor} business hour',
  //     'list business hour',
  //     'list {HoursFor} business hour',
  //     'what is business hour',
  //     'what is {HoursFor} business hour',
  //     'see business hour',
  //     'see {HoursFor} business hour' ])
  // })

  test('generate lex', () => {
    const lex = {
      'metadata': {
        'schemaVersion': '1.0',
        'importType': 'LEX',
        'importFormat': 'JSON'
      },
      'resource': {
        'name': 'RCAssistant',
        'version': '1',
        'intents': [
        ],
        'slotTypes': [
        ],
        'voiceId': '0',
        'childDirected': false,
        'locale': 'en-US',
        'idleSessionTTLInSeconds': 600,
        'clarificationPrompt': {
          'messages': [
            {
              'contentType': 'PlainText',
              'content': 'Sorry, I did not understand, can you rephrase that?'
            }
          ],
          'maxAttempts': 5
        },
        'abortStatement': {
          'messages': [
            {
              'contentType': 'PlainText',
              'content': 'Sorry, I could not understand. Please try again.'
            }
          ]
        }
      }
    }
    fs.writeFileSync('aws_lex_generated.json', JSON.stringify(lex, null, 2))
  })
})
