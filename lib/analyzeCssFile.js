const parseCssFile = require('./parseCssFile');
const StyleComplexityAnalyzer = require('./StyleComplexityAnalyzer');

module.exports = async function parseCss(filePath) {
	const ast = await parseCssFile(filePath);
	const styleComplexityAnalyzer = new StyleComplexityAnalyzer(ast);

	return styleComplexityAnalyzer.getComplexity();
};
