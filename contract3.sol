pragma solidity ^0.4.5;

contract FileSigner {
	
	struct File {
		uint id;
		string fileHash;
		string filename;
		address[] signers;
	}

  uint internal lastId;
	mapping (uint => File) public files;

	event FileCreated(uint fileId, string filename, string filehash);
	event FileSigned(uint fileId, string filename, string filehash, address signer);

	function FileSigner() {  
		lastId = 0;
	}
	
	function fileWithSigners(uint fileId) returns (uint, string, string, address[]) {
		File memory file = files[fileId];
		return (file.id, file.fileHash, file.filename, files[fileId].signers);
	}

	function addFile(string filename, string fileHash) {
		lastId += 1;

		// Create new file & sign
		files[lastId].id = lastId;
		files[lastId].fileHash = fileHash;
		files[lastId].filename = filename;
		files[lastId].signers.push(msg.sender);

		// Fire creation & signed event
		FileCreated(lastId, filename, fileHash);
		FileSigned(lastId, filename, fileHash, msg.sender);
	}

	function signFile(uint fileId) {
		File memory file = files[fileId];

		// Check if contract exists
		require(file.id > 0);

		// Signe the file
		files[fileId].signers.push(msg.sender);

		// Fire signed event
		FileSigned(fileId, file.filename, file.fileHash, msg.sender);
	}

}