'use strict';
const {expect} = require('chai');
const path = require('path');
const fs = require('fs');
const {
	preppendChangelog
} = require('../lib/changelog.js');

const cleanup = function () {
	try {
		fs.unlinkSync(path.join(process.cwd(), 'changelog'));
	} catch (error) {}
};

describe('changelog.preppendChangelog', function () {

	before(cleanup);
	after(cleanup);

	it('Should prepend a new file', function () {

		const changelogPath = preppendChangelog('world', 'changelog');
		expect(changelogPath).to.be.a('string');
		const content = fs.readFileSync(changelogPath).toString('utf8');
		expect(content).to.be.equal('world');

	});

	it('Should prepend a file', function () {

		const changelogPath = preppendChangelog('hello', 'changelog');
		expect(changelogPath).to.be.a('string');
		const content = fs.readFileSync(changelogPath).toString('utf8');
		expect(content).to.be.equal('helloworld');

	});

});