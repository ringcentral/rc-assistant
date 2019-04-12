/* eslint-env jest */
import { toPairs, formatObj, cartesianProduct } from '../src/util'

describe('util', () => {
  test('toPairs', () => {
    expect(toPairs({
      hello: 'world'
    })).toEqual([
      { path: [ 'hello' ], val: 'world' }
    ])
    expect(toPairs({
      hello: 'world', aaa: 'bbb'
    })).toEqual([
      { path: [ 'hello' ], val: 'world' },
      { path: [ 'aaa' ], val: 'bbb' }
    ])
    expect(toPairs({
      'contact': {
        'firstName': 'XM',
        'businessAddress': {
          'city': 'San Mateo'
        }
      }
    })).toEqual([
      { path: [ 'contact', 'firstName' ], val: 'XM' },
      { path: [ 'contact', 'businessAddress', 'city' ],
        val: 'San Mateo' }
    ])
  })
  test('formatObj', () => {
    expect(formatObj({
      hello: 'world'
    })).toBe('**hello**: world')
    expect(formatObj({
      hello: 'world', aaa: 'bbb'
    })).toBe(`**hello**: world
**aaa**: bbb`)
    expect(formatObj({
      'contact': {
        'firstName': 'XM',
        'businessAddress': {
          'city': 'San Mateo'
        }
      }
    })).toBe(`**contact firstName**: XM
**contact businessAddress city**: San Mateo`)
  })

  test('cartesian product', () => {
    expect(cartesianProduct([1, 2, 3], ['a', 'b', 'c'])).toEqual([
      '1 a', '1 b', '1 c', '2 a', '2 b', '2 c', '3 a', '3 b', '3 c'
    ])
    expect(cartesianProduct([1, 2], ['a', 'b'], ['@', '#'])).toEqual([
      '1 a @', '1 a #', '1 b @', '1 b #', '2 a @', '2 a #', '2 b @', '2 b #'
    ])
  })
})
