'use strict';
const path = require('path');
const inquirer = require('inquirer');

const config = {
	types:{
		feat:'new feature for the user, not a new feature for build script',
		fix:'bug fix for the user, not a fix to a build script',
		docs:'changes to the documentation',
		style:'formatting, missing semi colons, etc; no production code change',
		refactor:'refactoring production code, eg. renaming a variable',
		test:'adding missing tests, refactoring tests; no production code change',
		chore:'updating grunt tasks etc; no production code change'
	},
	scopes:[],
	relations:[
		'closes',
		'fixes'
	],
	triggers:[]
};

try {
	const localConfig = require(path.join(process.cwd(), '.gitchangelog'));
	Object.assign(config, localConfig);
} catch (error) {}

const run = async () => {
	const types = Object.keys(config.types);

	const entry = {
		type:types[0],
		scope:config.scopes.length > 0 ? config.scopes[0] : '',
		subject:'',
		body:null,
		relations:{}
	};

	let answer;

	answer = await inquirer.prompt({
		type:'list',
		name:'type',
		message:'Which commit type are you doing?',
		choices: types,
		default: entry.type
	});
	entry.type = answer.type;

	if (config.scopes.length > 0) {
		answer = await inquirer.prompt({
			type: 'list',
			name: 'scope',
			message: 'Which commit scope are you doing?',
			choices: config.scopes,
			default: entry.scope
		});
	} else {
		answer = await inquirer.prompt({
			type: 'input',
			name: 'scope',
			message: 'What commit scope are you doing?'
		});
	}
	entry.scope = answer.scope;

	answer = await inquirer.prompt({
		type: 'input',
		name: 'subject',
		message: 'Enter the subject:'
	});
	entry.subject = answer.subject;

	answer = await inquirer.prompt({
		type: 'input',
		name: 'body',
		message: 'Enter the body (description of commit, leave empty to ignore):'
	});
	if (answer.body.length > 0)
		entry.body = answer.body;


};

run();