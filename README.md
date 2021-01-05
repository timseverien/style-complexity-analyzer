# Style Complexity Analyzer

This project is an experiment to measure CSS complexity as described in my article, [What Makes CSS Hard to Master](https://timseverien.com/posts/2020-12-06-what-makes-css-hard-to-master/).

Note that this is an experiment. By no means is the project mature enough to use.

## Installation

Clone the repository and navigate into the directory:

```bash
git clone https://github.com/timseverien/style-complexity-analyzer.git
cd style-complexity-analyzer
```

Install dependencies (requires npm):

```bash
npm install
```

## Usage

```bash
node bin/analyze.js https://timseverien.com
```

## Measurement

The complexity score is a weighted sum of several other complexity scores:

```js
const complexity = classnameComplexity
	+ domCouplingComplexity
	+ nestingComplexity
	+ quantityComplexity;
```

### Classname complexity

Classname complexity is measured by taking all classname selectors (e.g. `.button`) and consider the hierarchy. Consider the following examples:

```css
.button {}
.ghost-button {}
```

In the previous example, the `.ghost-button` class to describe the appearance of a variant of a button. An alternative to do this, is to use BEM (Block Element Modifier):

```css
.button {}
.button--ghost {}
```

The former example are two seperate classes. The latter creates a hierarchy based on naming convention only. The tool will give the latter example a lower complexity score than the former.

### DOM Coupling

Selectors that rely on a relation of DOM nodes, like those in the following examples, get additional complexity scores.

```css
/* Relation between descendants */
.button img {}
.button > img {}

/* Relation between siblings */
.button + .button {}
.button ~ .button {}
```

### At-rule Nesting

Selectors inside in at-rules get additional complexity.

```css
@media (...) {
	.button {}
}
```

### Quantity

The quantity is simply the number of selectors 🤷‍♀
