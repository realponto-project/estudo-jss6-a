const fs = require('fs')

const { NODE_ENV = 'test' } = process.env
if (!NODE_ENV) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.',
  )
}

const dotenvFiles = [
  `.env.${NODE_ENV}`,
  '.env',
]

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv').config({ // eslint-disable-line global-require
      path: dotenvFile,
    })
  }
})
