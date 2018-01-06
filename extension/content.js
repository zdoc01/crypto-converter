console.log = console.log.bind(console, '[crypto]');
console.error = console.error.bind(console, '[crypto]');

const COIN_VAL_REGEX = /[0-9]\.[0-9]*/g; // e.g. 0.0934, 1.1960, etc.

const findNodes = (...selectors) => {
	let nodes = [];

	selectors.forEach(selector => {
		nodes = nodes.concat(
			Array.from(document.querySelectorAll(selector))
		);
	});

  return nodes;
};

// Returns an array containing the value,
// and the node which contains said value.
// e.g. [ node, value ]
const getCoinValues = (nodes) => {
  return nodes.map((node) => {
    const parent = node.parentNode;
    if (parent) {
        const match = parent.innerText.match(COIN_VAL_REGEX);
        if (match.length) {
          return [ parent, match[0] ];
        } else {
          console.log('no match found for node', node);
          return [];
        }
    } else {
      console.log('no parent found for node', node);
      return [];
    }
  });
};

const renderLink = (text, titleText) => {
  return `<a href="#" title="${titleText}">${text}</a>`;
};

const decorateValue = (node, value, currentRate) => {
	const rate = currentRate || 1;
  if (node && value) {
		const convertedValue = `$${value * rate}`;
    node.innerHTML = node.innerHTML.replace(value, renderLink(value, convertedValue));
  }
};

const getCurrentRate = () => new Promise((resolve, reject) => {
	const msg = { type: 'get:rate' };
	chrome.runtime.sendMessage(msg, (res) => {
	  if (res) {
			resolve(res);
		} else {
			reject('Rate not found');
		}
	});
});

const updateValues = rate => {
	const nodes = findNodes('small', 'em');
	const coinVals = getCoinValues(nodes);
	coinVals.forEach(data => decorateValue(...data, rate));
};

// Message handler
const onMessage = (req, sender) => {
	if (req.type === 'set:rate') {
		updateValues(req.rate);
	}
};

const main = () => {
	getCurrentRate()
		.then(updateValues)
		.catch(console.error);
};

window.addEventListener('DOMContentLoaded', (event) => {
	console.log('ready to rock');
	setTimeout(main, 500); // give scripts time to render
});

chrome.runtime.onMessage.addListener(onMessage);
