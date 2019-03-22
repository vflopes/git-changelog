'use strict';
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const {
	askType,
	askScope,
	askSubject,
	askChanges,
	askLabels
} = require('./lib/prompts.js');
const {
	executeScripts,
	buildEnvsFromObject
} = require('./lib/scripts.js');
const {
	preppendChangelog
} = require('./lib/changelog.js');
const {
	loadTemplate
} = require('./lib/template.js');

const config = {
	changelogFilename:'CHANGELOG.md',
	changelogTemplate:'default',
	commitTemplate:'karma',
	types:'karma',
	scopes:[],
	labels:[
		'action',
		'version'
	],
	beforeCommit:[],
	afterCommit:[]
};

try {
	const localConfig = fs.readFileSync(path.join(process.cwd(), '.gitchangelog')).toString('utf8');
	Object.assign(config, JSON.parse(localConfig));
} catch (error) {}

if (config.types === 'karma') {
	config.types = {
		feat: 'new feature for the user, not a new feature for build script',
		fix: 'bug fix for the user, not a fix to a build script',
		docs: 'changes to the documentation',
		style: 'formatting, missing semi colons, etc; no production code change',
		refactor: 'refactoring production code, eg. renaming a variable',
		test: 'adding missing tests, refactoring tests; no production code change',
		chore: 'updating grunt tasks etc; no production code change'
	};
} else if (config.types === 'atom') {
	config.types = {
		'🎨 - code improvement': 'when improving the format/structure of the code',
		'🐎 - performance improvement': 'when improving performance',
		'🚱 - memory leak': 'when plugging memory leaks',
		'📝 - docs': 'when writing docs',
		'🐧 - linux fix': 'when fixing something on Linux',
		'🍎 - macos fix': 'when fixing something on macOS',
		'🏁 - windows fix': 'when fixing something on Windows',
		'🐛 - bug fix': 'when fixing a bug',
		'🔥 - removing code/files': 'when removing code or files',
		'💚 - ci build fix': 'when fixing the CI build',
		'✅ - adding tests': 'when adding tests',
		'🔒 - security changes': 'when dealing with security',
		'⬆️ - upgrading dependencies': 'when upgrading dependencies',
		'⬇️ - downgrading dependencies': 'when downgrading dependencies',
		'👕 - linter compliance': 'when removing linter warnings',
	};
}

const commitTemplate = loadTemplate(
	config.commitTemplate,
	__dirname,
	'commit'
);

const changelogTemplate = loadTemplate(
	config.changelogTemplate,
	__dirname,
	'changelog'
);

const run = async () => {
	const entry = {
		type:null,
		scope:null,
		subject:null,
		body:null,
		labels:null
	};

	entry.type = await askType(Object.keys(config.types));
	entry.scope = await askScope(config.scopes);
	entry.subject = await askSubject();
	entry.body = await askChanges();
	entry.labels = await askLabels(config.labels);
	
	const commitMessage = commitTemplate(entry);
	const changelogMessage = changelogTemplate(entry);

	const scriptsEnvs = buildEnvsFromObject(entry);

	if (config.beforeCommit.length > 0) {
		console.log(chalk.cyanBright.bold('executing scripts before commmit...'));
		executeScripts(config.beforeCommit, scriptsEnvs);
	}

	console.log(chalk.cyanBright.bold('the commit message:'));
	console.log(commitMessage);

	executeScripts([[
		'git',
		'commit',
		...process.argv.slice(2),
		'-m',
		commitMessage
	]], scriptsEnvs);

	console.log(chalk.cyanBright.bold('the changelog message:'));
	console.log(changelogMessage);

	const changelogPath = preppendChangelog(changelogMessage, config.changelogFilename);
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
	], scriptsEnvs);

	if (config.afterCommit.length > 0) {
		console.log(chalk.cyanBright.bold('executing scripts after commmit...'));
		executeScripts(config.afterCommit, scriptsEnvs);
	}

	console.log(chalk.greenBright.bold('committed'));

};

if (process.argv[2] === '-h' || process.argv[2] === '--help') {
	console.log('\nUsage: git changelog [git commit options]\n');
	console.log('Allowed types:');
	for (const type in config.types)
		console.log(`  ${chalk.bold(type)}: ${config.types[type]}`);
	process.exit(0);
} else if (process.argv[2] === '-i' || process.argv[2] === '--install') {
	let path = '!' +process.argv[0];
	executeScripts([`git config --global alias.changelog '${path}'`]);
	process.exit(0);
}

run();