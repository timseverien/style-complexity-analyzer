module.exports = async function fetchStyle(browser, url) {
	const page = await browser.newPage();
	const css = [];

	page.on('response', async (response) => {
		const resourceType = response.request().resourceType();

		if (resourceType === 'stylesheet') {
			css.push(await response.text());
		}
	});

	await page.goto(url);

	css.push(...await page.$$eval('style', elements => elements.map(e => e.textContent)));

	await page.close();

	return css.join('\n\n');
};
