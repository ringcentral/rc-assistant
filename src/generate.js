import * as R from 'ramda'
import pluralize from 'pluralize'
import { pascalCase } from 'change-case'

const actions = {
  view: ['view', 'see', 'show', 'display', 'get', 'list'],
  edit: ['edit', 'change', 'update', 'set', 'alter', 'modify']
}

export const generateIntentUtterances = (action, subject, slotName) => {
  subject = pluralize(subject)
  const utterances = []
  R.forEach(verb => {
    utterances.push(`${verb} ${subject}`)
    if (slotName) {
      utterances.push(`${verb} {${slotName}} ${subject}`)
      utterances.push(`${verb} ${subject} for {${slotName}}`)
    }
  })(actions[action])
  if (action === 'view') {
    utterances.unshift(`${subject} for {${slotName}}`)
    utterances.unshift(`{${slotName}} ${subject}`)
    utterances.unshift(subject)
  }
  return utterances
}

export const generateSlotUtterances = (action, subject, slotName) => {
  const utterances = generateIntentUtterances(action, subject, slotName)
  return R.pipe(
    R.filter(u => u.includes(`{${slotName}}`)),
    R.slice(0, 10)
  )(utterances)
}

export const generateDefinitions = (prefix, items) => {
  const { action, subject, slot } = items[0]
  const intentUtterances = generateIntentUtterances(action, subject, slot.name)
  const slotUtterances = generateSlotUtterances(action, subject, slot.name)
  const intents = [
    {
      'name': `${prefix}${pascalCase(action)}${pascalCase(subject)}`,
      'version': '1',
      'fulfillmentActivity': {
        'type': 'ReturnIntent'
      },
      'sampleUtterances': intentUtterances,
      'slots': [
        {
          'sampleUtterances': slotUtterances,
          'slotType': `${prefix}${pascalCase(subject)}${pascalCase(slot.name)}`,
          'slotTypeVersion': '1',
          'slotConstraint': 'Required',
          'valueElicitationPrompt': {
            'messages': [
              {
                'contentType': 'PlainText',
                content: slot.options.map(synonyms => `**${synonyms[0]}** ${subject}`).join(' or ') + '?'
              }
            ],
            'responseCard': '{"version":1,"contentType":"application/vnd.amazonaws.card.generic","genericAttachments":[]}',
            'maxAttempts': 2
          },
          'priority': 1,
          'name': slot.name
        }
      ]
    }
  ]
  const slotTypes = [
    {
      description: `${subject} ${slot.name}`,
      name: `${prefix}${pascalCase(subject)}${pascalCase(slot.name)}`,
      version: '1',
      enumerationValues: slot.options.map(synonyms => ({
        value: synonyms[0],
        synonyms: R.tail(synonyms)
      })),
      valueSelectionStrategy: 'TOP_RESOLUTION'
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
