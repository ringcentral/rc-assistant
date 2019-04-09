/* eslint-env jest */
import fs from 'fs'

import { generateIntentUtterances, generateSlotUtterances } from '../src/generate'

describe('generateIntentUtterances', () => {
  test('view business hour', () => {
    const action = 'view'
    const subject = 'business hour'
    const slot = 'HoursFor'
    var utterances = generateIntentUtterances(action, subject, slot)
    expect(utterances).toEqual([
      'business hours', '{HoursFor} business hours', 'business hours for {HoursFor}',
      'view business hours', 'view {HoursFor} business hours', 'view business hours for {HoursFor}',
      'see business hours', 'see {HoursFor} business hours', 'see business hours for {HoursFor}',
      'show business hours', 'show {HoursFor} business hours', 'show business hours for {HoursFor}',
      'display business hours', 'display {HoursFor} business hours', 'display business hours for {HoursFor}',
      'get business hours', 'get {HoursFor} business hours', 'get business hours for {HoursFor}',
      'list business hours', 'list {HoursFor} business hours', 'list business hours for {HoursFor}'
    ])
  })
})

describe('generateSlotUtterances', () => {
  test('view business hour', () => {
    const action = 'view'
    const subject = 'business hour'
    const slot = 'HoursFor'
    var utterances = generateSlotUtterances(action, subject, slot)
    expect(utterances).toEqual([
      '{HoursFor} business hours', 'business hours for {HoursFor}',
      'view {HoursFor} business hours', 'view business hours for {HoursFor}',
      'see {HoursFor} business hours', 'see business hours for {HoursFor}',
      'show {HoursFor} business hours', 'show business hours for {HoursFor}',
      'display {HoursFor} business hours', 'display business hours for {HoursFor}'
    ])
  })
})

describe('generate whole file', () => {
  test('generate lex', () => {
    const action = 'view'
    const subject = 'business hour'
    const slot = 'HoursFor'
    var intentUtterances = generateIntentUtterances(action, subject, slot)
    var slotUtterances = generateSlotUtterances(action, subject, slot)
    const intents = [
      {
        'name': 'RCAssistantBusinessHours',
        'version': '1',
        'fulfillmentActivity': {
          'type': 'ReturnIntent'
        },
        'sampleUtterances': intentUtterances,
        'slots': [
          {
            'sampleUtterances': slotUtterances,
            'slotType': 'RCAssistantBusinessHoursTypes',
            'slotTypeVersion': '1',
            'slotConstraint': 'Required',
            'valueElicitationPrompt': {
              'messages': [
                {
                  'contentType': 'PlainText',
                  'content': 'Would you like to view your **personal business hours** or the **company business hours**? '
                }
              ],
              'responseCard': '{"version":1,"contentType":"application/vnd.amazonaws.card.generic","genericAttachments":[]}',
              'maxAttempts': 2
            },
            'priority': 1,
            'name': 'HoursFor'
          }
        ]
      }
    ]
    const slotTypes = [
      {
        'description': 'personal or company business hours',
        'name': 'RCAssistantBusinessHoursTypes',
        'version': '1',
        'enumerationValues': [
          {
            'value': 'personal',
            'synonyms': [
              'my'
            ]
          },
          {
            'value': 'company',
            'synonyms': [
              'office', 'organization', 'institution', 'enterprise'
            ]
          }
        ],
        'valueSelectionStrategy': 'TOP_RESOLUTION'
      }
    ]
    const lex = {
      'metadata': {
        'schemaVersion': '1.0',
        'importType': 'LEX',
        'importFormat': 'JSON'
      },
      'resource': {
        'name': 'RCAssistant',
        'version': '1',
        intents,
        slotTypes,
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
