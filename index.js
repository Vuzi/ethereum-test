const express = require('express')
const bodyParser = require('body-parser')
var session = require('express-session')
const router = express.Router()
const app = express()

const eth = require('./ethereum')

// Auth middleware
const withAuth = (req, res, next) => {
  if(req.session.account) {
		// TODO unlock account for transaction, then lock after the transaction
		req.account = req.session.account
		next()
	} else
  	res.status(403).send({ error: true, message: 'Forbidden - You need to be authenticated to access this page' })
}

app.use(bodyParser.json())
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))


// Balance management

router.get('/:fileid', withAuth, (req, res) => {
	const fileId = req.params.fileid || 0
	
	if(fileId <= 0)
		return res.status(400).send({ error: true, message: 'Invalid id provided' })

	eth.fileSigner.get(fileId).then(file => {
  	res.send(file)
	})
})

router.get('/:fileid/sign', withAuth, (req, res, next) => {
	const fileId = req.params.fileid || 0
	
	if(fileId <= 0)
		return res.status(400).send({ error: true, message: 'Invalid id provided' })

	eth.fileSigner.get(fileId).then(signers => {
  	res.send(signers)
	}).catch(e => next(e))
})

router.post('/:fileid/sign', withAuth, (req, res, next) => {
	const fileId = req.params.fileid || 0
	
	if(fileId <= 0)
		return res.status(400).send({ error: true, message: 'Invalid id provided' })

	eth.fileSigner.sign(req.account.address, fileId).then(file => {
  	res.send(file)
	}).catch(e => next(e))
})

router.put('/', withAuth, (req, res, next) => {
	const hash = req.body.hash || ''
	const filename = req.body.filename || ''

	eth.fileSigner.create(req.account.address, filename, hash).then(detail => {
  	res.send(detail)
	}).catch(e => next(e))
})

app.use('/filesigner', router)



// Account management

app.get('/me', withAuth, (req, res) => {
	res.send(req.account)
})

app.post('/create', (req, res, next) => {
	const password = req.body.password || ''
	eth.account.create(password).then(account => {
		req.session.account = { addresse: account.address }
		res.send(account)
	}).catch(e => next(e))
})

app.post('/import', (req, res, next) => {
	const password = req.body.password || ''
	const privateKey = req.body.privateKey || ''

	eth.account.import(privateKey, password).then(account => {
		// TODO maybe put the password in the account to unlock the sessions ?
		req.session.account = { addresse: account.address }
		res.send(account)
	}).catch(e => next(e))
})

app.post('/login', (req, res, next) => {
	const password = req.body.password || ''
	const address = req.body.address || ''

	if(!eth.utils.isAddress(address))
		return res.status(400).send({ error: true, message: 'Invalid address' })
	
	eth.account.unlock(address, password).then(account => {
		req.session.account = account
		res.send(account)
	}).catch(e => next(e))
})

app.get('/logout', (req, res) => {
	req.session.user = undefined
	res.send({ disconnected: true })
})


// Error middleware
app.use((err, req, res, next) => {
	console.error(err)
  res.status(500).send({ error: true, message: err.message || 'An error occurred' })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
