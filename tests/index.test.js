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
    const results = await findCode('Wow', { directory: dir })

    results.forEach(r => { r.path = 'path' })
    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!',
      path: 'path'
    }])
  })

  it('finds code in more than one file', async () => {
    const dir = path.join(pathToFixtures, 'multiple')
    const results = await findCode('Wow', { directory: dir })

    results.forEach(r => { r.path = 'path' })
    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!',
      path: 'path'
    }, {
      file: 'another-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!',
      path: 'path'
    }])
  })

  it('finds code using a simple regular expression', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode(/W.*w/, { directory: dir })

    results.forEach(r => { r.path = 'path' })
    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!',
      path: 'path'
    }])
  })

  it('finds code using a case-insensitive regular expression', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode(/THIS.*is.*AM[a-z]+g!/i, { directory: dir })

    results.forEach(r => { r.path = 'path' })
    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'This is amazing!',
      lineNumber: 3,
      block: 'Check this out!\n\nThis is amazing!\n\nWow!',
      path: 'path'
    }])
  })

  it('finds code using a line-starting regular expression', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode(/^W/, { directory: dir })

    results.forEach(r => { r.path = 'path' })
    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!',
      path: 'path'
    }])
  })

  it('respects the beginning of file boundary (cannot be less than line 0)', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode('Check this out!', { directory: dir })

    results.forEach(r => { r.path = 'path' })
    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Check this out!',
      lineNumber: 1,
      block: 'Check this out!\n\nThis is amazing!',
      path: 'path'
    }])
  })

  it('respects the end of file boundary (cannot be greater than total lines)', async () => {
    const dir = path.join(pathToFixtures, 'single')
    const results = await findCode('Wow!', { directory: dir })

    results.forEach(r => { r.path = 'path' })
    expect(results).toEqual([{
      file: 'a-file.txt',
      line: 'Wow!',
      lineNumber: 5,
      block: 'This is amazing!\n\nWow!',
      path: 'path'
    }])
  })
})
