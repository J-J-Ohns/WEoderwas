require('dotenv').config()
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const mongoose = require('mongoose')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
const shoppingListsRouter = require('./routes/shoppingLists')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

if(!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set')
    process.exit(1)
}

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.error('Database connection successful'))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/shoppingLists', shoppingListsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app
