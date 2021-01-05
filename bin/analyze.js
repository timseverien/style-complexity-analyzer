const puppeteer = require('puppeteer');
const isUrl = require('is-url');

const analyzeStyle = require('../lib/analyzeStyle');
const fetchStyle = require('../lib/fetchStyle');
const reporterConsole = require('../lib/reporters/console');

const [url] = process.argv.slice(2);

if (!isUrl(url)) {
	console.error(`URL "${url}" is not a valid URL.`);
	process.exit();
}

(async () => {
	const browser = await puppeteer.launch();

	try {
		console.log('STATUS: Downloading styles');

		const styles = await fetchStyle(browser, url);

		console.log('STATUS: Parsing styles');

		const report = {
			url,
			...(await analyzeStyle(styles)),
		};

		reporterConsole([report]);
	} catch (error) {
		console.error(error);
	}

	await browser.close();
})();
