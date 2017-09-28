const Web3 = require('web3');

const provider = 'http://localhost:8545'

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(provider))


const VuziCoinAddr = "0x35fce31d4f5DfD20C5Ff376FcEF0B7B6e0c1B44E"
const VuziCoinAbi = [ { "constant": true, "inputs": [], "name": "minter", "outputs": [ { "name": "", "type": "address", "value": "0x4777f4e0bd68fa03dc70837f493f860750b4e918" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "balances", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "receiver", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "mint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "receiver", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "send", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "from", "type": "address" }, { "indexed": false, "name": "to", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "Sent", "type": "event" } ]
const VuziCoin = new web3.eth.Contract(VuziCoinAbi, VuziCoinAddr);

const Ethereum = {

	balance : {
		get: (from) => {
			return VuziCoin.methods.balances(from).call().then(res => {
				return { balance: res }
			})
		},

		send: (from, to, quantity) => {
			return VuziCoin.methods.send(to, quantity + 0).send({ from: from }).then(res => {
				return { send: quantity, to: to }
			})
		}
	},

	account : {
		create: (password) => {
			try {
				const account = web3.eth.accounts.create(web3.utils.randomHex(32))

				// Import the created account
				return Ethereum.account.import(account.privateKey.substring(2), password)
			} catch(e) {
				return Promise.reject(e)
			}
		},

		import: (privateKey, password) => {
			if(privateKey.startsWith('0x') || privateKey.startsWith('0X'))
				privateKey = privateKey.substring(2)

			return web3.eth.personal.importRawKey(privateKey, password).then(res => {

				// Only return usefull infos
				return {
					address: res,
					privateKey: '0x' + privateKey
				}
			})
		},

		unlock: (address, password) => {
			return web3.eth.personal.unlockAccount(address, password).then(res => {
				
				// Only return usefull infos
				return {
					address: address
				}
			})
		}
	},

	utils : {
		isAddress: (address) => {
			return web3.utils.isAddress(address)
		}
	}

}


module.exports = Ethereum
