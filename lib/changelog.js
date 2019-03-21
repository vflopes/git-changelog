
const path = require('path');
const fs = require('fs');

const preppendChangelog = (content, changelogFilename) => {
	const changelogPath = path.join(process.cwd(), changelogFilename);
	let changelogContent = content;
	try {
		changelogContent = fs.readFileSync(
			changelogPath,
		).toString('utf8');
		changelogContent += content;
	} catch (error) {
		if (error.code !== 'ENOENT') {
			console.error(error);
			process.exit(129);
		}
	}
	fs.writeFileSync(
		changelogPath,
		changelogContent,
		{ encoding: 'utf8' },
	);
	return changelogPath;
};

module.exports = {
	preppendChangelog,
};
