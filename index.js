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

router.get('/', withAuth, (req, res) => {
	eth.balance.get(req.account.address).then(balance => {
  	res.send(balance)
	})
})

router.get('/:address', withAuth, (req, res, next) => {
	const address = req.params.address || ''
	
	if(!eth.utils.isAddress(address))
		return res.status(400).send({ error: true, message: 'Invalid address' })

	eth.balance.get(address).then(balance => {
  	res.send(balance)
	}).catch(e => next(e))
})

router.post('/send', withAuth, (req, res, next) => {
	const to = req.body.to || ''
	const quantity = req.body.quantity + 0

	if(!eth.utils.isAddress(to))
		return res.status(400).send({ error: true, message: 'Invalid "to" address' })
	if(quantity <= 0)
		return res.status(400).send({ error: true, message: 'Invalid quantity' })

	eth.balance.send(req.account.address, to, quantity).then(detail => {
  	res.send(detail)
	}).catch(e => next(e))
})

app.use('/balance', router)



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



// Tests

app.get('/', function (req, res) {
	/*
	var web3 = new Web3();
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
	
	const privateKey = '4d9aa93dac4e06b4095e3e0dbfa7a9f792141c957dd11a60700e120c3b520b1e'
	const account = web3.eth.accounts.privateKeyToAccount(privateKey);
	
	console.log(web3.eth.personal.importRawKey(privateKey, ""))

	//web3.personal.unlockAccount("0x4777f4E0bD68FA03DC70837f493F860750b4E918","12345678");
	//web3.eth.accounts.create();

	/*

	web3.eth.personal.unlockAccount("0x4777f4E0bD68FA03DC70837f493F860750b4E918", "12345678").then(res => {

		const VuziCoinAddr = "0x35fce31d4f5DfD20C5Ff376FcEF0B7B6e0c1B44E"
		const VuziCoinAbi = [ { "constant": true, "inputs": [], "name": "minter", "outputs": [ { "name": "", "type": "address", "value": "0x4777f4e0bd68fa03dc70837f493f860750b4e918" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "balances", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "receiver", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "mint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "receiver", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "send", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "from", "type": "address" }, { "indexed": false, "name": "to", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "Sent", "type": "event" } ]
		const VuziCoin = new web3.eth.Contract(VuziCoinAbi, VuziCoinAddr);

		VuziCoin.methods.balances("0x4777f4E0bD68FA03DC70837f493F860750b4E918").call().then(res => {
			console.log('balance = ', res); //, web3.utils.fromWei(res, 'ether'));
			//console.log('res', new BigNumber(res).toString(10));
		}).catch(err => {
			console.log('err', err);
		})

		VuziCoin.methods.send("0x9329B1e5dF3e54b1e03c3F7E3650069F15bfAb1b", 10).send({ from: "0x4777f4E0bD68FA03DC70837f493F860750b4E918" }).then(res => {
			console.log('send = ', res); //, web3.utils.fromWei(res, 'ether'));
			//console.log('res', new BigNumber(res).toString(10));
		}).catch(err => {
			console.log('err', err);
		})

	}).catch(err => {
		console.log('err', err);
	})
	*/

  res.send('Hello World!')
})

// Error middleware
app.use((err, req, res, next) => {
	console.error(err)
  res.send({ error: true, message: err.message || 'An error occurred' })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
