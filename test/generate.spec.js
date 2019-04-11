/* eslint-env jest */
import fs from 'fs'

import generate, { generateIntentUtterances, generateSlotUtterances } from '../src/generate'

describe('generateIntentUtterances', () => {
  test('view business hour', () => {
    const action = 'view'
    const subjects = ['business hours']
    const slot = 'type'
    const utterances = generateIntentUtterances(action, subjects, slot)
    expect(utterances).toEqual([
      'business hours', '{type} business hours', 'business hours for {type}',
      'view business hours', 'view {type} business hours', 'view business hours for {type}',
      'see business hours', 'see {type} business hours', 'see business hours for {type}',
      'show business hours', 'show {type} business hours', 'show business hours for {type}',
      'display business hours', 'display {type} business hours', 'display business hours for {type}',
      'get business hours', 'get {type} business hours', 'get business hours for {type}',
      'list business hours', 'list {type} business hours', 'list business hours for {type}'
    ])
  })
})

describe('generateSlotUtterances', () => {
  test('view business hour', () => {
    const action = 'view'
    const subjects = ['business hours']
    const slot = 'type'
    const utterances = generateSlotUtterances(action, subjects, slot)
    expect(utterances).toEqual([
      '{type} business hours', 'business hours for {type}',
      'view {type} business hours', 'view business hours for {type}',
      'see {type} business hours', 'see business hours for {type}',
      'show {type} business hours', 'show business hours for {type}',
      'display {type} business hours', 'display business hours for {type}'
    ])
  })
})

describe('generate whole file', () => {
  test('generate lex', () => {
    const lex = generate('RCAssistant', [
      {
        action: 'view',
        subjects: ['business hours', 'business hour'],
        slot: {
          name: 'type',
          options: [
            ['personal', 'my', 'for me', 'for myself'],
            ['company', 'office', 'enterprise', 'organization', 'institute', 'institution']
          ]
        }
      },
      {
        action: 'view',
        subjects: ['caller ID', 'callerID']
      },
      {
        action: 'view',
        subjects: ['company billing plan']
      },
      {
        action: 'view',
        subjects: ['company greetings', 'company greeting']
      },
      {
        action: 'view',
        subjects: ['company info', 'company information', 'company details']
      },
      {
        action: 'view',
        subjects: ['company service plan', 'service plan for company']
      },
      {
        action: 'view',
        subjects: ['company time zone', 'company timezone', 'company time-zone']
      }
    ])
    fs.writeFileSync('aws_lex_generated.json', JSON.stringify(lex, null, 2))
  })
})
