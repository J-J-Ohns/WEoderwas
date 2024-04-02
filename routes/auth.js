const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { validUsername, usernameAvailable, validPassword } = require('../middlewares/index.middleware')
const User = require('../models/user')

const router = express.Router()

router.get('/login', (req, res, next) => {
    res.render('auth', { register: false })
})

router.post('/login', [validUsername, validPassword], async (req, res) => {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    const correctPassword = await bcrypt.compare(password, user?.password || '')

    if (!correctPassword) {
        res.status(401).json({ error: 'Username or Password is incorrect' })
        return
    }

    createAndSetToken(res, { username: user.username })
    res.redirect('/')
})

router.get('/register', (req, res, next) => {
    res.render('auth', { register: true })
})

router.post('/register', [validUsername, usernameAvailable, validPassword], async (req, res, next) => {
    const { username, password } = req.body
    const pwHash = await bcrypt.hash(password, 10)
    let user
    try {
        user = await User.create({ username, password: pwHash })
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: 'An error occurred while creating the user' })
        return
    }

    createAndSetToken(res, { username: user.username })
    res.redirect('/')
})

router.post('auth/logout', (req, res, next) => {
    res.clearCookie('bearer').json({ message: 'Logout successfull' })
})

function createAndSetToken(res, data) {
    const token = jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: 3600,
    })

    res.cookie('bearer', token, { httpOnly: true })
}

module.exports = router
