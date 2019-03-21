
const chalk = require('chalk');
const { spawnSync, execSync } = require('child_process');

const buildEnvsFromObject = (object, prefix = 'GIT_CHANGELOG_') => {
	const envs = {};
	Object.keys(object).forEach((key) => {
		envs[prefix + key.toUpperCase()] = typeof object[key] === 'string' ? object[key] : JSON.stringify(object[key]);
	});
	return envs;
};

const executeScripts = (scripts, scriptsEnvs = {}) => {
	const scriptOptions = {
		cwd: process.cwd(),
		stdio: 'inherit',
		env: {
			...process.env,
			...scriptsEnvs,
		},
		windowsHide: true,
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
				scriptOptions,
			);
			if (spawnResult.status !== 0) process.exit(spawnResult.status);
			continue;
		}

		console.log(chalk.bold('script: ') + chalk.gray(script));

		try {
			execSync(
				script,
				scriptOptions,
			);
		} catch (error) {
			process.exit(error.status);
		}
	}
};

module.exports = {
	buildEnvsFromObject,
	executeScripts,
};
