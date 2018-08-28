const execa = require('execa')

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
async function getFileBoundaries (path, line, padding = 2) {
  const { stdout } = await execa('wc', ['-l', path])
  const total = parseInt(stdout, 10) + 1

  const start = Math.max(line - padding, 1)
  const end = Math.min(line + padding, total)

  return { start, end }
}

/**
 * Find occurences of the provided string in your files.
 * Like grep, but with more context.
 * @param {string|RegExp} query - Query string or RegEx
 * @param {Options} [options={}] - Options
 * @returns {FoundCode[]}
 */
module.exports = async (query, options = {}) => {
  const opts = {
    directory: process.cwd(),
    exclude: ['node_modules'],
    ...options
  }

  const isString = typeof query === 'string'
  const isRegEx = query instanceof RegExp

  if (!query || !(isString || isRegEx)) {
    throw new Error('The provided query must be a String or Regular Expression.')
  }

  let args = [query, '-rn', opts.directory, `--exclude-dir={${opts.exclude.join(',')}}`]

  // If its a RegEx, make add the relevant flags
  if (isRegEx) {
    args = getRegExArgs(args)
  }

  const { stdout } = await execa('grep', args)

  const results = stdout.toString().split('\n')
  const formatted = results.map(async result => {
    const [path, lineNumberString, line] = result.split(':')
    const lineNumber = parseInt(lineNumberString, 10)

    const file = path.replace(opts.directory + '/', '')

    // Get the contents of the file at the given range
    const { start, end } = await getFileBoundaries(path, lineNumber)
    const range = `${start},${end}p`
    const { stdout: block } = await execa('sed', ['-n', range, path])

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

/**
 * @typedef {Object} Options
 * @prop {string} [directory=process.cwd()] - Directory to scan
 * @prop {string[]} [exclude=['node_modules']] - Array of directories to ignore
 */
