/* eslint-env jest */
import fs from 'fs'

import generate, { generateIntentUtterances, generateSlotUtterances } from '../src/generate'

describe('generateIntentUtterances', () => {
  test('view business hour', () => {
    const action = 'view'
    const subject = 'business hour'
    const slot = 'HoursFor'
    const utterances = generateIntentUtterances(action, subject, slot)
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
    const utterances = generateSlotUtterances(action, subject, slot)
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
    const lex = generate('RCAssistant', [
      { action: 'view',
        subject: 'business hour',
        slot: {
          name: 'type',
          options: [
            ['personal', 'my', 'for me', 'for myself'],
            ['company', 'office', 'enterprise', 'organization', 'institute', 'institution']]
        }
      }
    ])
    fs.writeFileSync('aws_lex_generated.json', JSON.stringify(lex, null, 2))
  })
})
