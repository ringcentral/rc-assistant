/* eslint-env jest */
import fs from 'fs'

import { generateUtterances } from '../src/generate'

describe('generateUtterances', () => {
  test('view business hour', () => {
    const action = 'view'
    const subject = 'business hour'
    const slot = 'HoursFor'
    var utterances = generateUtterances(action, subject, slot)
    console.log(utterances)
    expect(utterances).toEqual([
      'business hours',
      '{HoursFor} business hours',
      'view business hours',
      'view {HoursFor} business hours',
      'show business hours',
      'show {HoursFor} business hours',
      'display business hours',
      'display {HoursFor} business hours',
      'get business hours',
      'get {HoursFor} business hours',
      'list business hours',
      'list {HoursFor} business hours',
      'what are business hours',
      'what are {HoursFor} business hours',
      'see business hours',
      'see {HoursFor} business hours'
    ])
  })

  test('generate lex', () => {
    const action = 'view'
    const subject = 'business hour'
    const slot = 'HoursFor'
    var utterances = generateUtterances(action, subject, slot)
    const intents = [
      {
        'name': 'RCAssistantBusinessHours',
        'version': '1',
        'fulfillmentActivity': {
          'type': 'ReturnIntent'
        },
        'sampleUtterances': utterances,
        'slots': [
          {
            'sampleUtterances': [
              'I would like to see business hours for {HoursFor}',
              '{HoursFor} business hours',
              'business hours for {HoursFor}'
            ],
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
              'my', 'me'
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
