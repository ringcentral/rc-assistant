import * as R from 'ramda'
import { pascalCase } from 'change-case'

const actions = {
  view: ['view', 'see', 'show', 'display', 'get', 'list'],
  edit: ['edit', 'change', 'update', 'set', 'alter', 'modify']
}

export const generateIntentUtterances = (action, subjects, slot) => {
  const { name, preposition } = (slot || {})
  const utterances = []
  R.forEach(verb => {
    R.reverse(subjects).forEach(subject => {
      utterances.push(`${verb} ${subject}`)
      if (name) {
        utterances.push(`${verb} {${name}} ${subject}`)
        utterances.push(`${verb} ${subject} ${preposition || ''} {${name}}`.replace(/\s+/g, ' '))
      }
    })
  })(actions[action])
  R.reverse(subjects).forEach(subject => {
    if (action === 'view') {
      if (name) {
        utterances.unshift(`${subject} ${preposition || ''} {${name}}`.replace(/\s+/g, ' '))
        utterances.unshift(`{${name}} ${subject}`)
      }
      utterances.unshift(subject)
    }
  })
  return utterances
}

export const generateSlotUtterances = (action, subjects, slot) => {
  const utterances = generateIntentUtterances(action, subjects, slot)
  return R.pipe(
    R.filter(u => u.includes(`{${slot.name}}`)),
    R.slice(0, 10)
  )(utterances)
}

export const generateDefinitions = (prefix, items) => {
  const intents = []
  const slotTypes = []
  for (const item of items) {
    const { action, subjects, slot, utterances } = item
    if (!subjects) {
      intents.push({
        'name': `${prefix}${pascalCase(action)}`,
        'version': '1',
        'fulfillmentActivity': {
          'type': 'ReturnIntent'
        },
        sampleUtterances: utterances
      })
      continue
    }
    const subject = subjects[0]
    intents.push({
      'name': `${prefix}${pascalCase(action)}${pascalCase(subject)}`,
      'version': '1',
      'fulfillmentActivity': {
        'type': 'ReturnIntent'
      }
    })
    if (!slot) {
      R.last(intents).sampleUtterances = generateIntentUtterances(action, subjects)
    } else {
      R.last(intents).sampleUtterances = generateIntentUtterances(action, subjects, slot)
      R.last(intents).slots = [
        {
          'sampleUtterances': generateSlotUtterances(action, subjects, slot),
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
      slotTypes.push({
        description: `${subject} ${slot.name}`,
        name: `${prefix}${pascalCase(subject)}${pascalCase(slot.name)}`,
        version: '1',
        enumerationValues: slot.options.map(synonyms => ({
          value: synonyms[0],
          synonyms: R.tail(synonyms)
        })),
        valueSelectionStrategy: 'TOP_RESOLUTION'
      })
    }
  }
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
