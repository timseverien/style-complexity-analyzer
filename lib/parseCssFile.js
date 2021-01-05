const fs = require('fs-extra');
const csstree = require('css-tree');

module.exports = async function parseCss(filePath) {
	const content = await fs.readFile(filePath);

	return csstree.parse(content.toString(), {
		positions: false,
	});
};
