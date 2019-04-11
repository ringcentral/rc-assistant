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

export const generateLex = (intents, slotTypes) => {
  return {
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
}
