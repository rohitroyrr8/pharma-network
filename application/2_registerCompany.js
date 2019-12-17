'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
let gateway;

async function main(companyCRN, companyName, location, organisationRole) {

	try {

		const contract = await getContractInstance();

		// Create a new student account
		console.log('.....Registering a new company');
		const buffer = await contract.submitTransaction('registerCompany', ctx, companyCRN, companyName, location, organisationRole);

		// process response
		console.log('.....Processing Create Student Transaction Response \n\n');
		let obj = JSON.parse(buffer.toString());
		console.log(obj);
		console.log('\n\n.....Register Company Transaction Complete!');
		return obj;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		console.log('.....Disconnecting from Fabric Gateway');
		gateway.disconnect();

	}
}


module.exports.execute = main;
