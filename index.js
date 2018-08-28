const execa = require('execa')
const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)

/**
 * Add the required cli arguments for grep to consider the RegEx
 * @param {string[]} args - grep arguments
 * @returns {string[]}
 */
function getRegExArgs (args) {
  const { source, flags } = args[0]
  const newArgs = ['-E', source, ...args.slice(1)]

  if (flags.includes('i')) {
    // case-insensitive
    newArgs.push('-i')
  }

  return newArgs
}

/**
 * Return a range of line numbers, keeping mind of the
 * start and end lines of the given file.
 * @param {string} path - Path to the file
 * @param {number} line - Line number to pad from
 * @param {number} [padding=3] - Amount of lines to pad
 * @returns {Range}
 */
async function getFileBoundaries (path, line, padding = 3) {
  const { stdout } = await execa('wc', ['-l', path])
  const total = parseInt(stdout, 10) + 1

  const start = Math.max(line - padding, 0)
  const end = Math.max(line + padding, total)

  return { start, end }
}

/**
 * Find occurences of the provided string in your files.
 * Like grep, but with more context.
 * @param {string|RegExp} query - Query string or RegEx
 * @param {string} [directory] - Directory to search in
 * @returns {FoundCode[]}
 */
module.exports = async (query, directory = process.cwd()) => {
  const exclude = ['node_modules']

  const isString = typeof query === 'string'
  const isRegEx = query instanceof RegExp

  if (!query || !(isString || isRegEx)) {
    throw new Error('The provided query must be a String or Regular Expression.')
  }

  let args = [query, '-rn', directory, `--exclude-dir={${exclude.join(',')}}`]

  // If its a RegEx, make sure that it is understood as such
  if (isRegEx) {
    args = getRegExArgs(args)
  }

  const { stdout } = await execa('grep', args)

  const results = stdout.toString().split('\n')
  const formatted = results.map(async result => {
    const [path, lineNumberString, line] = result.split(':')
    const lineNumber = parseInt(lineNumberString, 10)

    const file = path.replace(directory + '/', '')
    const { start, end } = await getFileBoundaries(path, lineNumber)

    // TODO: Find a way to read only a range of the file
    const contents = await readFile(path, 'utf8')
    const block = contents.split(/\r\n|\n/).slice(start, end).join('\n')

    return {
      lineNumber,
      file,
      line,
      block
    }
  })

  return Promise.all(formatted)
}

/**
 * @typedef {Object} FoundCode
 * @prop {string} file - File name
 * @prop {string} line - The entire line that had a match
 * @prop {number} lineNumber - The line number that had a match
 * @prop {string} block - A block of lines surrounding the matched line
 */

/**
 * @typedef {Object} Range
 * @prop {number} start
 * @prop {number} end
 */
