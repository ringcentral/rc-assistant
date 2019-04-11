import * as R from 'ramda'
import pluralize from 'pluralize'

const actions = {
  view: ['view', 'see', 'show', 'display', 'get', 'list'],
  edit: ['edit', 'change', 'update', 'set', 'alter', 'modify']
}

export const generateIntentUtterances = (action, subject, slot) => {
  subject = pluralize(subject)
  const utterances = []
  R.forEach(verb => {
    utterances.push(`${verb} ${subject}`)
    if (slot) {
      utterances.push(`${verb} {${slot}} ${subject}`)
      utterances.push(`${verb} ${subject} for {${slot}}`)
    }
  })(actions[action])
  if (action === 'view') {
    utterances.unshift(`${subject} for {${slot}}`)
    utterances.unshift(`{${slot}} ${subject}`)
    utterances.unshift(subject)
  }
  return utterances
}

export const generateSlotUtterances = (action, subject, slot) => {
  const utterances = generateIntentUtterances(action, subject, slot)
  return R.pipe(
    R.filter(u => u.includes(`{${slot}}`)),
    R.slice(0, 10)
  )(utterances)
}

export const generateDefinitions = (prefix, items) => {
  const { action, subject, slot } = items[0]
  const intentUtterances = generateIntentUtterances(action, subject, slot)
  const slotUtterances = generateSlotUtterances(action, subject, slot)
  const intents = [
    {
      'name': `${prefix}BusinessHours`,
      'version': '1',
      'fulfillmentActivity': {
        'type': 'ReturnIntent'
      },
      'sampleUtterances': intentUtterances,
      'slots': [
        {
          'sampleUtterances': slotUtterances,
          'slotType': `${prefix}BusinessHoursTypes`,
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
      'name': `${prefix}BusinessHoursTypes`,
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
  return { intents, slotTypes }
}

export const generateLex = (name, intents, slotTypes) => {
  return {
    'metadata': {
      'schemaVersion': '1.0',
      'importType': 'LEX',
      'importFormat': 'JSON'
    },
    'resource': {
      name,
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
}

const generate = (name, items) => {
  const { intents, slotTypes } = generateDefinitions(name, items)
  const lex = generateLex(name, intents, slotTypes)
  return lex
}

export default generate
