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
		const companyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [companyCRN]);
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

/**
	 * register a new drug on to the network
	 *
	 */


	async function addDrug(ctx, drugName, serialNo, mfgData, expDate companyCRN) {
		const productKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName+'-'+serialNo]);
		const manufacturerKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.manufacturer', [companyCRN]);

		this.validateInitiator(ctx, manufacturerOrg);

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

	/**
	 create a new Purchase Order
	 */
	
	async function createPO (ctx, buyerCRN, sellerCRN, drugName, quantity) {
		// check if the intitator of POis Distributor or Retailer
		if (!(this.validateInitiator(ctx,distributorOrg)) || (this.validateInitiator(ctx,retailerOrg))) {

			throw new Error('Purchase Order can be created by companies belonging to Distributor or Retailer Oraganisation');
		}

		// check for hierarchy


		const purchaseKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchase-order', [buyerCRN+'-'+drugName]);
		const buyerKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [buyerCRN]);
		const sellerKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [sellerCRN]);
		

		let newPOObj = {
			poId : purchaseKey,
			drugName : drugName,
			quantity : quantity,
			buyer : buyerKey,
			seller : sellerKey,
			createdAt: new Date(),
			updatedAt: new Date(),
		};		

		let dataBuffer = Buffer.from(JSON.stringify(newPOObj));
		await ctx.stub.putState(purchaseKey, dataBuffer);
		return newPOObj;
	}

	/**
	 Create a new shipment
	 */

	async function createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN ) {

	const purchaseKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchase-order', [buyerCRN+'-'+drugName]);

	//fetch the company name for transporter key
    const companyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [transporterCRN]);
    let companybuffer =  await ctx.stub
				.getState(companyKey)
				.catch(err => console.log(err));
	let companyObject = JSON.parse(companyBuffer.toString());
	let transporterName = companyObject.companyName;

	const transporterKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment-order',[transporterCRN+'-'+transporterName]);

	const shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment-order',[buyerCRN+'-'+drugName]);

	// Fetch purchase order with  from blockchain
		let orderBuffer = await ctx.stub
				.getState(purchaseKey)
				.catch(err => console.log(err));
		let orderObject = JSON.parse(orderBuffer.toString());

		// check if the purchase order quantity is same as list of assests



		if ( orderObject.quantity !== listOfAssets.length) {
			throw new Error('Purchase Order quantities donot match');
		}

		let assetArray = [];
		// Validate asset ids 
		forEach(ass : listOfAssets) {

			const drugKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [ass.drugName+'-'+ass.serialNo]);
			//get state
			let assestBuffer = await ctx.stub
				.getState(drugKey)
				.catch(err => console.log(err));
			if ( assetBuffer === 0)  {
				throw new Error('Invalid Durgname or Serial No');

			}

			let assetObject = JSON.parse(assetBuffer.toString());
			assetObject.owner = transporterKey;
			let dataBuffer = Buffer.from(JSON.stringify(assetObject));
			await ctx.stub.putState(drugKey, dataBuffer);
			assetArray.push(drugKey);
			
		} 


		// shipment  data model
		let newShipmentObj = {
			shipmentId : shipmentKey,
			creator : ctx.clientIdentity.getID(),
			assests : assetArray,
			transporter : transporterKey,
			status: 'in-transit',
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		let dataBuffer = Buffer.from(JSON.stringify(newShipmentObj));
		await ctx.stub.putState(shipmentKey, dataBuffer);
		return newShipmentObj;
	}

	
		


	async function updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
		//check if the intitator of Tx is transporter
		this.validateInitiator(ctx, transporterOrg);

	const shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment-order',[buyerCRN+'-'+drugName]);	

	 // Fetch shipment order with  from blockchain
		let shipmentBuffer = await ctx.stub
				.getState(shipmentKey)
				.catch(err => console.log(err));
		let shipmentObject = JSON.parse(orderBuffer.toString());

		
	//

	forEach( ass : shipmentObject.assests) {

			const drugKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [ass.drugName+'-'+ass.serialNo]);
			//get state
			let assestBuffer = await ctx.stub
				.getState(drugKey)
				.catch(err => console.log(err));
			

			let assetObject = JSON.parse(assetBuffer.toString());
			const buyerKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [buyerCRN]);
			assetObject.owner = buyerKey;
			assetObject.shipment.push(shipmentKey);
			let dataBuffer = Buffer.from(JSON.stringify(assetObject));
			await ctx.stub.putState(drugKey, dataBuffer);
			
			
		} 

	
		shipmentObject.status = 'delivered';
		shipmentObject.updatedAt = new Date();
		let dataBuffer = Buffer.from(JSON.stringify(shipmentObject));
		await ctx.stub.putState(shipmentKey, dataBuffer);
		return shipmentObject;

	}

	async function retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
		
		//check the intiator of the tx is retailer
		this.validateInitiator(ctx, retailerOrg);

		const productKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName+'-'+serialNo]);
		const retailerKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [retailerCRN]);
		// fetch the drug with the respective product key

		let assestBuffer = await ctx.stub
				.getState(drugKey)
				.catch(err => console.log(err));
			

		let assetObject = JSON.parse(assetBuffer.toString());

		// change the ownership with the drug 
		assetObject.owner = customerAadhar;
		//push the new key to  the shipment list of Drug object
		assetObject.shipment.push(retailerKey);
		let dataBuffer = Buffer.from(JSON.stringify(assetObject));
		await ctx.stub.putState(productKey, dataBuffer);
		return assetObject;


	}

	async function viewHistory(ctx, drugName, serialNo) {

		const productKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName+'-'+serialNo]);



	}
	
	async function viewDrugCurrentState (ctx, drugName, serialNo) {

		const productKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [drugName+'-'+serialNo]);
		let productBuffer= await ctx.stub.getState(productKey).catch(err => console.log(err));
		let productObject= JSON.parse(propertyBuffer.toString());
		return productObject;

	}

}



module.exports = PharmanetContract;
