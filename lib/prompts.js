
const inquirer = require('inquirer');

const askType = async (types) => {
	const answer = await inquirer.prompt({
		type: 'list',
		name: 'type',
		message: 'which commit type are you doing?',
		choices: types,
		default: types[0],
	});
	return answer.type;
};

const askScope = async (scopes = []) => {
	if (scopes.length > 0) {
		const answer = await inquirer.prompt({
			type: 'list',
			name: 'scope',
			message: 'which commit scope are you doing?',
			choices: scopes,
			default: scopes.length > 0 ? scopes[0] : null,
		});
		return answer.scope;
	}
	const answer = await inquirer.prompt({
		type: 'input',
		name: 'scope',
		message: 'what is the scope of the commit?',
	});
	return answer.scope;
};

const askSubject = async () => {
	const answer = await inquirer.prompt({
		type: 'input',
		name: 'subject',
		message: 'enter the subject (ex: the issue(s) id):',
	});
	return answer.subject;
};

const askChanges = async () => {
	let body = null;
	let answer;
	/* eslint-disable no-constant-condition */
	while (true) {
		const { addChange } = await inquirer.prompt({
			type: 'confirm',
			name: 'addChange',
			message: 'do you want do describe a change?',
		});
		if (!addChange) break;
		answer = await inquirer.prompt({
			type: 'input',
			name: 'body',
			message: 'enter the description:',
		});
		answer.body = answer.body.trim();
		if (answer.body.length > 0) {
			if (body === null) body = [];
			body.push(answer.body);
		}
	}
	/* eslint-enable no-constant-condition */
	return body;
};

const askLabels = async (labels = []) => {
	const values = {};
	let answer = await inquirer.prompt({
		type: 'checkbox',
		name: 'labels',
		choices: labels,
		message: 'does this commit have one or more label(s) listed bellow?',
	});
	for (const label of answer.labels) {
		answer = await inquirer.prompt({
			type: 'input',
			name: 'value',
			message: `enter the content of "${label}" label (leave empty to ignore):`,
		});
		answer.value = answer.value.trim();
		if (answer.value.length > 0) values[label] = answer.value;
	}
	return values;
};

module.exports = {
	askType,
	askScope,
	askSubject,
	askChanges,
	askLabels,
};
