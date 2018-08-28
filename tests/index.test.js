const findCode = require('..')
const path = require('path')
const pathToFixtures = path.join(__dirname, 'fixtures')

describe('find-code', () => {
  it('throws an error if the provided query is not a string or RegExp', async () => {
    try {
      await findCode({})
    } catch (e) {
      expect(e.message).toBe('The provided query must be a String or Regular Expression.')
    }
  })

  it('finds code in one file', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode('Wow', dir)

    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!\n'
    }])
  })

  it('finds code in more than one file', async () => {
    const dir = path.join(pathToFixtures, 'multiple')
    const results = await findCode('Wow', dir)

    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!\n'
    }, {
      file: 'another-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!\n'
    }])
  })

  it('finds code using a simple regular expression', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode(/W.*w/, dir)

    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!\n'
    }])
  })

  it('finds code using a case-insensitive regular expression', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode(/THIS.*is.*AM[a-z]+g!/i, dir)

    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'This is amazing!',
      lineNumber: 3,
      block: 'Check this out!\n\nThis is amazing!\n\nWow!\n'
    }])
  })

  it('finds code using a line-starting regular expression', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode(/^W/, dir)

    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!\n'
    }])
  })

  it('respects the beginning of file boundary (cannot be less than line 0)', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode('Check this out!', dir)

    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Check this out!',
      lineNumber: 1,
      block: 'Check this out!\n\nThis is amazing!\n\nWow!\n'
    }])
  })

  it('respects the end of file boundary (cannot be greater than total lines)', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode('Wow!', dir)

    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!\n'
    }])
  })
})
