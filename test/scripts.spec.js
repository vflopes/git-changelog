'use strict';
const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const {
	buildEnvsFromObject,
	executeScripts,
} = require('../lib/scripts.js');

const cleanup = function () {
	try {
		fs.unlinkSync(path.join(__dirname, 'tmpfile'));
	} catch (error) {}
};

describe('scripts.buildEnvsFromObject', function () {

	it('Should return envs object', function () {

		const result = buildEnvsFromObject({key:123}, 'PREFIX_');
		expect(result.PREFIX_KEY).to.be.a('string');
		expect(result.PREFIX_KEY).to.be.equal('123');

	});

});

describe('scripts.executeScripts', function () {

	after(cleanup);

	const filePath = path.join(__dirname, 'tmpfile');

	it('Should execute string command', function () {

		executeScripts([
			`echo 'hello' > ${filePath}`
		]);
		const content = fs.readFileSync(filePath).toString('utf8');
		expect(content).to.be.a('string');
		expect(content).to.be.equal('hello\n');

	});

	it('Should execute array command', function () {

		executeScripts([
			[
				'bash',
				'-c',
				`echo 'helloarray' > ${filePath}`
			]
		]);
		const content = fs.readFileSync(filePath).toString('utf8');
		expect(content).to.be.a('string');
		expect(content).to.be.equal('helloarray\n');

	});

});