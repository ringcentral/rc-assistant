import * as R from 'ramda'

const actions = {
  view: ['view', 'show', 'display', 'get', 'list', 'what is', 'see'],
  edit: ['edit', 'change', 'update', 'set', 'alter', 'modify']
}

export const generateUtterances = (action, subject, slot) => {
  const utterances = []
  R.forEach(verb => {
    utterances.push(`${verb} ${subject}`)
    if (slot) {
      utterances.push(`${verb} {${slot}} ${subject}`)
    }
  })(actions[action])
  if (action === 'view') {
    utterances.unshift(`{${slot}} ${subject}`)
    utterances.unshift(subject)
  }
  return utterances
}
