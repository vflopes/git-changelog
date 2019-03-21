'use strict';
const {expect} = require('chai');
const inquirer = require('inquirer');
const {
	askType,
	askScope,
	askSubject,
	askChanges,
	askLabels,
} = require('../lib/prompts.js');

const mockInquirer = (keyValue = {}) => {
	inquirer.prompt = async ({name}) => ({
		[name]:typeof keyValue[name] === 'function' ? keyValue[name]() : keyValue[name]
	});
}

describe('prompts.askType', function () {

	it('Should return type', function (done) {

		mockInquirer({
			type:'mytype'
		});

		askType(['mytype']).then((type) => {
			expect(type).to.be.a('string');
			expect(type).to.be.equal('mytype');
			done();
		}).catch(done);

	});

});

describe('prompts.askScope', function () {

	it('Should return scope', function (done) {

		mockInquirer({
			scope:'myscope'
		});

		askScope(['myscope']).then((scope) => {
			expect(scope).to.be.a('string');
			expect(scope).to.be.equal('myscope');
			done();
		}).catch(done);

	});

	it('Should return custom scope', function (done) {

		mockInquirer({
			scope:'mycustom'
		});

		askScope([]).then((scope) => {
			expect(scope).to.be.a('string');
			expect(scope).to.be.equal('mycustom');
			done();
		}).catch(done);

	});

});

describe('prompts.askSubject', function () {

	it('Should return subject', function (done) {

		mockInquirer({
			subject:'mysubject'
		});

		askSubject(['mysubject']).then((subject) => {
			expect(subject).to.be.a('string');
			expect(subject).to.be.equal('mysubject');
			done();
		}).catch(done);

	});

});

describe('prompts.askChanges', function () {

	it('Should return body with changes', function (done) {

		let i = 1;

		mockInquirer({
			addChange:() => Boolean(i--),
			change:'mychange'
		});

		askChanges().then(([change]) => {
			expect(change).to.be.a('string');
			expect(change).to.be.equal('mychange');
			done();
		}).catch(done);

	});

	it('Should return empty body', function (done) {

		mockInquirer({
			addChange:false
		});

		askChanges().then((body) => {
			expect(body).to.be.equal(null);
			done();
		}).catch(done);

	});

});

describe('prompts.askLabels', function () {

	it('Should return body with changes', function (done) {

		mockInquirer({
			labels:['mykey'],
			value:'myvalue'
		});

		askLabels(['mykey']).then(({mykey}) => {
			expect(mykey).to.be.a('string');
			expect(mykey).to.be.equal('myvalue');
			done();
		}).catch(done);

	});

});