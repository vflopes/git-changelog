'use strict';
const {expect} = require('chai');
const path = require('path');
const {
	loadTemplate
} = require('../lib/template.js');

describe('template.loadTemplate', function () {

	it('Should load a template', function () {

		const loadedTemplate = loadTemplate('karma', path.join(__dirname, '..'), 'commit');
		const message = loadedTemplate({
			'type': 'any',
			'scope': 'any',
			'subject': 'any',
			'body': ['any', 'any'],
			'labels': {
				'any':'any'
			}
		});
		expect(message).to.be.a('string');
		expect(message.match(/any/g).length).to.be.equal(7);

	});

	it('Should return the source template', function () {

		const loadedTemplate = loadTemplate('{{=it.type}}', path.join(__dirname, '..'), 'commit');
		const message = loadedTemplate({
			'type': 'any',
			'scope': 'any',
			'subject': 'any',
			'body': ['any', 'any'],
			'labels': {
				'any':'any'
			}
		});
		expect(message).to.be.a('string');
		expect(message.match(/any/g).length).to.be.equal(1);

	});

});