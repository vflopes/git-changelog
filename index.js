'use strict';
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const doT = require('dot');

doT.templateSettings = {
	...doT.templateSettings,
	strip:false
};

const config = {
	changelogFilename:'CHANGELOG.md',
	changelogTemplate:'default',
	commitTemplate:'karma',
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
	labels:[
		'action',
		'version'
	],
	beforeCommit:[],
	afterCommit:[]
};

try {
	const localConfig = require(path.join(process.cwd(), '.gitchangelog'));
	Object.assign(config, localConfig);
} catch (error) {}

let commitTemplate = config.commitTemplate;
if ([
	'karma',
	'bitbucket'
].includes(commitTemplate))
	commitTemplate = fs.readFileSync(
		path.join(__dirname, `./templates/commit/${commitTemplate}.dot`)
	).toString('utf8');

commitTemplate = doT.template(commitTemplate);

let changelogTemplate = config.changelogTemplate;
if ([
	'default'
].includes(changelogTemplate))
	changelogTemplate = fs.readFileSync(
		path.join(__dirname, `./templates/changelog/${changelogTemplate}.dot`)
	).toString('utf8');

changelogTemplate = doT.template(changelogTemplate);

const scriptsEnvs = {};
const executeScripts = (scripts) => {

	const scriptOptions = {
		cwd:process.cwd(),
		stdio:'inherit',
		env:{
			...process.env,
			...scriptsEnvs
		},
		windowsHide:true
	};

	for (const script of scripts) {
		
		if (Array.isArray(script)) {
			const [
				command,
				...args
			] = script;
			const spawnResult = spawnSync(
				command,
				args,
				scriptOptions
			);
			if (spawnResult.status !== 0)
				process.exit(spawnResult.status);
			continue;
		}

		console.log(chalk.bold('script: ')+chalk.gray(script));

		try {
			execSync(
				script,
				scriptOptions
			);
		} catch (error) {
			process.exit(error.status);
		}

	}

	return true;

}

const preppendChangelog = (content) => {
	const changelogPath = path.join(process.cwd(), config.changelogFilename);
	let changelogContent = content;
	try {
		changelogContent = fs.readFileSync(
			changelogPath
		).toString('utf8');
		changelogContent = changelogContent+content;
	} catch (error) {
		if (error.code !== 'ENOENT') {	
			console.error(error);
			process.exit(129);
		}
	}
	fs.writeFileSync(
		changelogPath,
		changelogContent,
		{encoding:'utf8'}
	);
	return changelogPath;
};

const run = async () => {
	const types = Object.keys(config.types);

	const entry = {
		type:types[0],
		scope:config.scopes.length > 0 ? config.scopes[0] : '',
		subject:'',
		body:null,
		labels:{}
	};

	let answer;

	answer = await inquirer.prompt({
		type:'list',
		name:'type',
		message:'which commit type are you doing?',
		choices: types,
		default: entry.type
	});
	entry.type = answer.type;

	if (config.scopes.length > 0) {
		answer = await inquirer.prompt({
			type: 'list',
			name: 'scope',
			message: 'which commit scope are you doing?',
			choices: config.scopes,
			default: entry.scope
		});
	} else {
		answer = await inquirer.prompt({
			type: 'input',
			name: 'scope',
			message: 'what is the scope of the commit?'
		});
	}
	entry.scope = answer.scope;

	answer = await inquirer.prompt({
		type: 'input',
		name: 'subject',
		message: 'enter the subject (ex: the issue(s) id):'
	});
	entry.subject = answer.subject;

	let addChange = true;

	while (addChange) {
		answer = await inquirer.prompt({
			type: 'confirm',
			name: 'addChange',
			message: 'do you want do describe a change?'
		});
		addChange = answer.addChange;
		if (!addChange)
			break;
		answer = await inquirer.prompt({
			type: 'input',
			name: 'body',
			message: 'enter the description:'
		});
		if (answer.body.length > 0) {
			if (entry.body === null)
				entry.body = [];
			entry.body.push(answer.body);
		}
	}
	
	if (config.labels.length > 0) {
		answer = await inquirer.prompt({
			type: 'checkbox',
			name: 'labels',
			choices: config.labels,
			message: 'does this commit have one or more label(s) listed bellow?'
		});
		for (const label of answer.labels) {
			answer = await inquirer.prompt({
				type: 'input',
				name: 'value',
				message: `enter the content of "${label}" label (leave empty to ignore):`
			});
			answer.value = answer.value.trim();
			if (answer.value.length > 0)
				entry.labels[label] = answer.value;
		}
	}
	
	const commitMessage = commitTemplate(entry);
	const changelogMessage = changelogTemplate(entry);

	Object.keys(entry).forEach((key) => {
		scriptsEnvs['GIT_CHANGELOG_'+key.toUpperCase()] = entry[key];
	});

	if (config.beforeCommit.length > 0) {
		console.log(chalk.cyanBright.bold('executing scripts before commmit...'));
		executeScripts(config.beforeCommit);
	}

	console.log(chalk.cyanBright.bold('the commit message will be:'));
	console.log(commitMessage);

	executeScripts([[
		'git',
		'commit',
		...process.argv.slice(2),
		'-m',
		commitMessage
	]]);

	console.log(chalk.cyanBright.bold('the changelog message will be:'));
	console.log(changelogMessage);

	const changelogPath = preppendChangelog(changelogMessage);
	console.log(changelogPath);
	executeScripts([
		[
			'git',
			'add',
			changelogPath
		],
		[
			'git',
			'commit',
			'-m',
			`Changelog update: ${new Date().toISOString()}`
		]
	]);

	if (config.afterCommit.length > 0) {
		console.log(chalk.cyanBright.bold('executing scripts after commmit...'));
		executeScripts(config.afterCommit);
	}

	console.log(chalk.greenBright.bold('commited'));

};

if (process.argv[2] === '-h' || process.argv[2] === '--help') {
	console.log('Usage: git changelog [git commit options]\n');
	console.log('Allowed types:');
	for (const type in config.types)
		console.log(`  ${chalk.bold(type)}: ${config.types[type]}`);
	process.exit(0);
}

run();