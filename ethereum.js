const Web3 = require('web3');

const provider = 'http://localhost:8545'

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(provider))


const FileSignerAddress = "0x7d743098B70373e49F699C30B10deDDc272840d4"
const FileSignerAbi = [ { "constant": false, "inputs": [ { "name": "filename", "type": "string" }, { "name": "fileHash", "type": "string" } ], "name": "addFile", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "fileId", "type": "uint256" } ], "name": "fileWithSigners", "outputs": [ { "name": "", "type": "uint256" }, { "name": "", "type": "string" }, { "name": "", "type": "string" }, { "name": "", "type": "address[]" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "files", "outputs": [ { "name": "id", "type": "uint256", "value": "0" }, { "name": "fileHash", "type": "string", "value": "" }, { "name": "filename", "type": "string", "value": "" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "fileId", "type": "uint256" } ], "name": "signFile", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "fileId", "type": "uint256" }, { "indexed": false, "name": "filename", "type": "string" }, { "indexed": false, "name": "filehash", "type": "string" } ], "name": "FileCreated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "fileId", "type": "uint256" }, { "indexed": false, "name": "filename", "type": "string" }, { "indexed": false, "name": "filehash", "type": "string" }, { "indexed": false, "name": "signer", "type": "address" } ], "name": "FileSigned", "type": "event" } ]
const FileSigner = new web3.eth.Contract(FileSignerAbi, FileSignerAddress);

const Ethereum = {
	fileSigner : {
		get: (fileId) => {
			return FileSigner.methods.fileWithSigners(fileId).call().then(file => {
				return {
					id: file["0"],
					fileHash: file["1"],
					filename: file["2"],
					signers: file["3"]
				}
			})
		},

		create: (from, filename, fileHash) => {
			return FileSigner.methods.addFile(filename, fileHash).send({ from: from, gasPrice: 100000000000 }).then(res => {
				console.log(res)
				return { res }
			})
		},

		sign: (from, fileId) => {
			return FileSigner.methods.signFile(fileId).send({ from: from }).then(res => {
				console.log(res)
				return { res }
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
