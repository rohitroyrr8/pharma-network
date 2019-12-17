const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Import all function modules
const addToWallet = require('./1_addToWallet');
const registerCompany = require('./2_registerCompany');
const addDrug = require('./3_addDrug');
const createPO = require('./4_createPO');
const createShipment = require('./5_createShipment');
const updateShipment = require('./6_updateShipment');
const retailDrug = require('./7_retailDrug');
const viewHistory = require('./8_viewHistory');
const viewDrugCurrentState = require('./9_viewDrugCurrentState');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma Network App');

app.get('/', (req, res) => res.send('hello world'));

app.post('/addToWallet', (req, res) => {
	addToWallet.execute(req.body.certificatePath, req.body.privateKeyPath)
			.then(() => {
				console.log('User credentials added to wallet');
				const result = {
					status: 'success',
					message: 'User credentials added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/newStudent', (req, res) => {
	createStudent.execute(req.body.studentId, req.body.name, req.body.email)
			.then((student) => {
				console.log('New student account created');
				const result = {
					status: 'success',
					message: 'New student account created',
					student: student
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/issueCertificate', (req, res) => {
	issueCertificate.execute(req.body.studentId, req.body.courseId, req.body.grade, req.body.hash)
			.then((certificate) => {
				console.log('New certificate issued to student');
				const result = {
					status: 'success',
					message: 'New certificate issued to student',
					certificate: certificate
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/verifyCertificate', (req, res) => {
	verifyCertificate.execute(req.body.studentId, req.body.courseId, req.body.hash)
			.then((verifyResult) => {
				console.log('Verification result available');
				const result = {
					status: 'success',
					message: 'Verification result available',
					verifyResult: verifyResult
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.listen(port, () => console.log(`Distributed Pharma Network App listening on port ${port}!`));