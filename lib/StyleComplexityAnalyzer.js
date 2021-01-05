const csstree = require('css-tree');

module.exports = class StyleComplexityAnalyzer {
	constructor(ast) {
		this._ast = ast;
	}

	/*
	 * Returns a weighted sum of various complexity
	 *
	 * Quantity (i.e. rule count): 1
	 * Nesting (i.e. rules in at-rules): 1 (note that rule count already includes these, so no additional weighting)
	 * Classname (based on grouping like BEM): 2
	 * DOM coupling: 3
	 */
	getComplexity() {
		const classnameCount = this._getClassnames().length;
		const selectorCount = csstree.findAll(this._ast, n => n.type === 'SelectorList').length;

		const classnameComplexity = 2 * this._getClassnameComplexity();
		const domCouplingComplexity = 3 * this._getDomCouplingComplexity();
		const nestingComplexity = 1 * this._getNestingComplexity();
		const quantityComplexity = 1 * this._getQuantityComplexity();

		const complexity = classnameComplexity
			+ domCouplingComplexity
			+ nestingComplexity
			+ quantityComplexity;

		return {
			// Style stats
			classnameCount,
			selectorCount,

			// Complexity
			classnameComplexity: Math.floor(classnameComplexity),
			domCouplingComplexity: Math.floor(domCouplingComplexity),
			nestingComplexity: Math.floor(nestingComplexity),
			quantityComplexity: Math.floor(quantityComplexity),

			// Aggregated complexity
			complexity: Math.floor(complexity),
		};
	}

	_getClassnameComplexity() {
		const classnameList = this._getClassnames();
		const classnameTree = StyleComplexityAnalyzer._createClassnameTree(classnameList);

		let count = 0;

		StyleComplexityAnalyzer._walkClassnameTree(classnameTree, (node, { depth }) => {
			// TODO: figure out a better way to avoid annoying floating issues
			// 1/3 + 1/3 + 1/3 = 0.99999 instead of 1
			count += 1 / (depth + 1);
		});

		return count;
	}

	_getClassnames() {
		const classnames = csstree
			.findAll(this._ast, n => n.type === 'ClassSelector')
			.map(n => n.name);

		return Array.from(new Set(classnames));
	}

	_getClassnamePrefixes(classnameModelList) {
		return Array.from(new Set(classnameModelList
			.filter(n => n.parts.length > 1)
			.map(n => n.parts.slice(0, n.parts.length - 1).join('-'))));
	}

	_getDomCouplingComplexity() {
		const ancestorCouplingComplexity = csstree.findAll(this._ast, this._isSelectorAncesterCoupled).length;
		const siblingCouplingComplexity = csstree.findAll(this._ast, this._isSelectorSiblingCoupled).length;

		return 2 * ancestorCouplingComplexity + siblingCouplingComplexity;
	}

	_getNestingComplexity() {
		const nestedItems =  csstree.findAll(this._ast, n => n.type === 'Atrule');
		const selectors = csstree.findAll(StyleComplexityAnalyzer._createFakeAstFromList(nestedItems), n => n.type === 'SelectorList');

		return selectors.length;
	}

	_getQuantityComplexity() {
		return csstree.findAll(this._ast, n => n.type === 'SelectorList').length;
	}

	_isSelectorAncesterCoupled(selector) {
		if (selector.type === 'Combinator') {
			return selector.name === '>';
		}

		return selector.type === 'WhiteSpace';
	}

	_isSelectorSiblingCoupled(selector) {
		if (selector.type === 'Combinator') {
			return selector.name === '~' || selector.name === '+';
		}

		if (selector.type === 'PseudoSelector') {
			return selector.name.startsWith(':nth') || selector.name.startsWith(':only');
		}

		return false;
	}

	static _createClassnameTree(classnameList) {
		const classnameModelList = classnameList.map(classname => ({
			name: classname,
			parts: classname.split(/[^0-9a-z]+/gi),
		}));

		const tree = {
			name: 'root',
			children: [],
		};

		for (const classnameModel of classnameModelList) {
			let branch = tree;

			for (const part of classnameModel.parts) {
				let node = branch.children.find(n => n.name === part);

				if (!node) {
					node = {
						name: part,
						children: [],
					};

					branch.children.push(node);
				}

				branch = node;
			}
		}

		return tree;
	}

	static _createFakeAstFromList(astList) {
		return {
			type: 'StyleSheet',
			children: astList,
		};
	}

	static _walkClassnameTree(classnameTree, fn, depth = 0) {
		// If *all* classnames are prefixed, pretend they don’t exist. (e.g. `c-foo` and `c-bar`)
		if (depth === 0 && classnameTree.children.length === 1) {
			return StyleComplexityAnalyzer._walkClassnameTree(classnameTree.children[0], fn, depth);
		}

		for (const child of classnameTree.children) {
			const context = { depth };

			fn(child, context);

			StyleComplexityAnalyzer._walkClassnameTree(child, fn, depth + 1);
		}
	}
};

