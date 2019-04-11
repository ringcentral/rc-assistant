import * as R from 'ramda'
import { pascalCase } from 'change-case'

const actions = {
  view: ['view', 'see', 'show', 'display', 'get', 'list'],
  edit: ['edit', 'change', 'update', 'set', 'alter', 'modify']
}

export const generateIntentUtterances = (action, subject, slotName) => {
  const utterances = []
  R.forEach(verb => {
    utterances.push(`${verb} ${subject}`)
    if (slotName) {
      utterances.push(`${verb} {${slotName}} ${subject}`)
      utterances.push(`${verb} ${subject} for {${slotName}}`)
    }
  })(actions[action])
  if (action === 'view') {
    if (slotName) {
      utterances.unshift(`${subject} for {${slotName}}`)
      utterances.unshift(`{${slotName}} ${subject}`)
    }
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
  const intents = []
  const slotTypes = []
  items.forEach(item => {
    const { action, subject, slot } = item
    intents.push({
      'name': `${prefix}${pascalCase(action)}${pascalCase(subject)}`,
      'version': '1',
      'fulfillmentActivity': {
        'type': 'ReturnIntent'
      }
    })
    if (!slot) {
      R.last(intents).sampleUtterances = generateIntentUtterances(action, subject)
    } else {
      R.last(intents).sampleUtterances = generateIntentUtterances(action, subject, slot.name)
      R.last(intents).slots = [
        {
          'sampleUtterances': generateSlotUtterances(action, subject, slot.name),
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
  })
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
