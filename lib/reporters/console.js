const { table } = require('table');

const numberFormatter = new Intl.NumberFormat();

const header = [
	'URL',
	'classname count',
	'selector count',
	'classname complexity',
	'DOM coupling',
	'nesting',
	'quantity',
	'complexity',
];

module.exports = (reports) => {
	const values = reports.map(r => Object.values(r));

	const data = [
		header,
		...values.map(r => r.map((value, index) => {
			if (index < 2) {
				return value;
			}

			return numberFormatter.format(value);
		})),
	];

	process.stdout.write(table(data, {
		drawHorizontalLine(index, size) {
			return index === 0 || index === 1 || index === size;
		},

		columns: {
			0: { alignment: 'left' },
			1: { alignment: 'right' },
			2: { alignment: 'right' },
			3: { alignment: 'right' },
			4: { alignment: 'right' },
			5: { alignment: 'right' },
			6: { alignment: 'right' },
			7: { alignment: 'right' },
		},
	}));
};
