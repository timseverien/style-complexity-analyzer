const csstree = require('css-tree');

const StyleComplexityAnalyzer = require('./StyleComplexityAnalyzer');

module.exports = async function parseCss(style) {
	const ast = csstree.parse(style, { positions: false })
	const styleComplexityAnalyzer = new StyleComplexityAnalyzer(ast);

	return styleComplexityAnalyzer.getComplexity();
};
