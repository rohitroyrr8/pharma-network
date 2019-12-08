'use strict';

const {Contract} = require('fabric-contract-api');

class PharmanetContract extends Contract {
	
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.pharmanet');
		global.manufacturerOrg = 'manufacturer.pharma-network.com';
  		global.distributorOrg = 'distriburtor.pharma-network.com'
  		global.retailerOrg = 'retailer.pharma-network.com'
  		global.transporterOrg = 'transporter.pharma-network.com'
	}

	validateInitiator(ctx, initiator) {
    	const initiatorID  =ctx.clientIdentity.trim().getX509Certificate();
    	if(initiatorID.issuer.organizationName.trim() !== initiator)  {
	    	throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
    	}
    }
	
	/* ****** All custom functions are defined below ***** */
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Pharmanet Smart Contract Instantiated');
	}
	
	/**
	 * register a new distriburtor company on to the network
	 * @param ctx - The transaction context object
	 * @param companyCRN
	 * @param companyName
	 * @param location
	 * @returns newCompanyObj
	 */
	async function registerCompany(ctx, companyCRN, companyName, location, organisationRole) {
		const companyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [companyCRN);
		const companyId = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [companyCRN+'-'+companyName]);
		let hierarchyKey;
		switch(organisationRole) {
			case 'Manufacturer' : 
					hierarchyKey = 1;
					break;
			case 'Distributor' : 
					hierarchyKey = 2;
					break;
			case 'Retailer' : 
					hierarchyKey = 3;
					break;
			case 'Transporter' : 
					hierarchyKey = 4;
					break;
			default : 
					throw new Error('invalid organisationRole found');
					break;
		}

		let newCompanyObj = {
			companyId : companyId
			companyName : companyName,
			location : location,
			organisationRole : organisationRole,
			hierarchyKey : hierarchyKey,
			createdAt: new Date(),
			updatedAt: new Date(),
		};		

		let dataBuffer = Buffer.from(JSON.stringify(newCompanyObj));
		await ctx.stub.putState(companyKey, dataBuffer);
		return newCompanyObj;
	}

	async function addDrug(ctx, drugName, serialNo, mfgData, expDate companyCRN) {
		const productKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName+'-'+serialNo]);
		const manufacturerKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.manufacturer', [companyCRN]);

		let newDrugObj = {
			productId : productKey,
			drugName : drugName,
			manufacturer : manufacturerKey
			mfgData : mfgData,
			expDate : expDate,
			owner : manufacturerKey,
			shippment : '',
			createdAt: new Date(),
			updatedAt: new Date(),
		};		

		let dataBuffer = Buffer.from(JSON.stringify(newDrugObj));
		await ctx.stub.putState(productKey, dataBuffer);
		return newDrugObj;
	}
	
	async function createPO (ctx, buyerCRN, sellerCRN, drugName, quantity) {
		const purchaseKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchase-order', [buyerCRN+'-'+drugName]);
		const buyerKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [buyerCRN);
		const sellerKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [sellerCRN);
		// drug takes place in a hierarchical manne

		let newPOObj = {
			poId : purchaseKey,
			drugName : drugName,
			manufacturer : manufacturerKey
			buyer : buyerKey,
			seller : sellerKey,
			createdAt: new Date(),
			updatedAt: new Date(),
		};		

		let dataBuffer = Buffer.from(JSON.stringify(newPOObj));
		await ctx.stub.putState(purchaseKey, dataBuffer);
		return newDrugObj;
	}

	async function createShipment(ctx, uyerCRN, drugName, listOfAssets, transporterCRN ) {
		
	}

	async function updateShipment(ctx, buyerCRN, drugName, transporterCRN) {

	}

	async function retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {

	}

	async function viewHistory(ctx, drugName, serialNo) {

	}
	
	async function viewDrugCurrentState (ctx, drugName, serialNo) {

	}


}

module.exports = PharmanetContract;