export const handle = async event => {
  console.log(event.type, 'event')
  switch (event.type) {
    case 'Message4Bot':
      break
    case 'GroupJoined': // bot user joined a new group
      break
    default:
      break
  }
}
