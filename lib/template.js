
const doT = require('dot');
const fs = require('fs');
const path = require('path');

doT.templateSettings = {
	...doT.templateSettings,
	strip: false,
};

const loadTemplate = (templateContent, basePath, templatesFolder) => {
	const templatesPath = path.join(basePath, 'templates', templatesFolder);
	const templates = fs.readdirSync(
		templatesPath,
	).map(
		item => item.replace(/\.dot$/, ''),
	);
	if (templates.includes(templateContent)) {
		return doT.template(
			fs.readFileSync(
				path.join(templatesPath, `${templateContent}.dot`),
			).toString('utf8'),
		);
	}
	return doT.template(templateContent);
};

module.exports = {
	loadTemplate,
};
