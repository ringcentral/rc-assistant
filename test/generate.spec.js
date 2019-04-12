/* eslint-env jest */
import fs from 'fs'

import generate, { generateIntentUtterances, generateSlotUtterances } from '../src/generate'

describe('generateIntentUtterances', () => {
  test('view business hour', () => {
    const action = 'view'
    const subjects = ['business hours']
    const slot = { name: 'type', preposition: 'for' }
    const utterances = generateIntentUtterances(action, subjects, slot)
    expect(utterances).toEqual([
      'business hours', '{businessHoursType} business hours', 'business hours for {businessHoursType}',
      'view business hours', 'view {businessHoursType} business hours', 'view business hours for {businessHoursType}',
      'see business hours', 'see {businessHoursType} business hours', 'see business hours for {businessHoursType}',
      'show business hours', 'show {businessHoursType} business hours', 'show business hours for {businessHoursType}',
      'display business hours', 'display {businessHoursType} business hours', 'display business hours for {businessHoursType}',
      'get business hours', 'get {businessHoursType} business hours', 'get business hours for {businessHoursType}',
      'list business hours', 'list {businessHoursType} business hours', 'list business hours for {businessHoursType}'
    ])
  })
})

describe('generateSlotUtterances', () => {
  test('view business hour', () => {
    const action = 'view'
    const subjects = ['business hours']
    const slot = { name: 'type', preposition: 'for' }
    const utterances = generateSlotUtterances(action, subjects, slot)
    expect(utterances).toEqual([
      '{businessHoursType} business hours', 'business hours for {businessHoursType}',
      'view {businessHoursType} business hours', 'view business hours for {businessHoursType}',
      'see {businessHoursType} business hours', 'see business hours for {businessHoursType}',
      'show {businessHoursType} business hours', 'show business hours for {businessHoursType}',
      'display {businessHoursType} business hours', 'display business hours for {businessHoursType}'
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
          preposition: 'for',
          options: [
            ['personal', 'my', 'for me', 'for myself'],
            ['company', 'office', 'enterprise', 'organization', 'institute', 'institution']
          ]
        }
      },
      {
        action: 'view',
        subjects: ['caller ID', 'callerID', 'caller ID settings', 'callerID settings', 'caller ID information', 'callerID information', 'caller ID info', 'callerID info']
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
      },
      {
        action: 'view',
        subjects: ['services'],
        slot: {
          name: 'status',
          options: [
            ['enabled', 'active', 'available', 'accessible'],
            ['disabled', 'inactive', 'unavailable', 'inaccessible']
          ]
        }
      },
      {
        action: 'hello',
        utterances: ['hello', 'hi', 'hey', 'hi there', 'good morning', 'good afternoon', 'good evening']
      },
      {
        action: 'view',
        subjects: ['presence info', 'presence information', 'do not disturb status', 'dnd status', 'user status', 'my status', 'status info', 'status information']
      },
      {
        action: 'view',
        subjects: ['personal info', 'personal information', 'personal details']
      },
      {
        action: 'view',
        subjects: ['notification settings', 'alert settings'],
        slot: {
          name: 'type',
          preposition: 'for',
          options: [
            ['voicemail', 'voicemails', 'voice mail', 'voice mails'],
            ['missed call', 'missed calls'],
            ['incoming fax', 'inbound fax', 'in fax', 'in-fax'],
            ['outgoing fax', 'outbound fax', 'out fax', 'out-fax'],
            ['incoming text', 'inbound text', 'in text', 'in-text']
          ]
        }
      },
      {
        action: 'edit',
        subjects: ['business hours', 'office hours', 'working hours', 'operating hours', 'hours of operation']
      },
      {
        action: 'edit',
        subjects: ['caller ID', 'callerID', 'caller ID settings', 'callerID settings', 'caller ID information', 'callerID information', 'caller ID info', 'callerID info']
      },
      {
        action: 'edit',
        subjects: ['personal info', 'personal information', 'personal details']
      }
    ])
    fs.writeFileSync('aws_lex_generated.json', JSON.stringify(lex, null, 2))
  })
})
