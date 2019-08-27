require('./helpers/loadenv')
const Express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const logger = require('morgan')
const databaseHelper = require('./helpers/database')
const errorFormatter = require('./helpers/errors/formatter')
const loginRoute = require('./routes/login')
const protectRoute = require('./routes/protect')
const { auth } = require('./middlewares/authentic')

const app = Express()

// const authRoute = require('./routes/auth')
// const unprotectedRoute = require('./routes/unprotected')
// const authentication = require('./middlewares/authentication')
// const uploadMiddleware = require('./middlewares/uploader')

// const routes = require('./routes')

/** MIDDLEWARES */
app.use(logger('dev'))
app.use(cors())
app.use(Express.static('public'))
app.use(bodyParser.json())

app.use('/oapi', loginRoute)
// app.use('/api', middlewareAuthentic)
app.use('/api', auth, protectRoute)
// app.post('/contract-upload', uploadMiddleware('file', 'temporary', { isTemp: true }))

// app.use(unprotectedRoute)
// app.use('/api/accounts', authentication)
// app.use('/api', authRoute)
// app.use('/api', routes)


/* error handlers */
app.use((err, req, res, next) => { //eslint-disable-line

  /* eslint-disable no-console */
  console.error(err.stack || err)
  console.error(JSON.stringify(err))
  const formattedError = errorFormatter(err)

  res.status(formattedError.status || 500)
  res.json(formattedError)
})

databaseHelper
  .isDatabaseConnected()
  .then(() => {
    const { PORT } = process.env

    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`)
    })
  })
