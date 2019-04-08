import * as R from 'ramda'
import pluralize from 'pluralize'

const actions = {
  view: ['view', 'see', 'show', 'display', 'get', 'list'],
  edit: ['edit', 'change', 'update', 'set', 'alter', 'modify']
}

export const generateUtterances = (action, subject, slot) => {
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
