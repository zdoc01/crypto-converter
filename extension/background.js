const RATE_API = 'https://fantasy-vue.herokuapp.com/api/crypto/rate?symbol=ETH-USD';
const CURRENT_RATE_KEY = 'currentRate';
const GET_RATE = 'rate:get';
const SET_RATE = 'rate:set';

const getJSON = (url) => new Promise((resolve, reject) => {
	fetch(url)
		.then(res => res.json())
		.then(resolve)
		.catch(reject);
});

const sendCurrentRate = (rate) => {
	console.log('sending rate to tabs', rate);
	const query = {
		active: true,
		currentWindow: true
	};

	const msg = {
		rate,
		type: SET_RATE
	};

	chrome.tabs.query(query, (tabs) => {
		if (tabs && tabs.length) {
			chrome.tabs.sendMessage(tabs[0].id, msg);
		}
	});
};

const getCurrentRateFromStorage = () => new Promise((resolve, reject) => {
	chrome.storage.sync.get(CURRENT_RATE_KEY, (items) => {
		resolve(items[CURRENT_RATE_KEY]);
	});
});

const saveCurrentRate = (rate) => new Promise((resolve, reject) => {
	chrome.storage.sync.set({[CURRENT_RATE_KEY]: rate}, () => {
		console.log('rate saved to storage');
		resolve(rate);
	});
});

// Message handler
const onMessage = (req, sender, sendResponse) => {
	if (req.type === GET_RATE) {
		getCurrentRateFromStorage().then(sendResponse);
	}
	return true; // allow async use of `sendResponse`
};

getJSON(RATE_API)
	.then((data) => {
		console.log('got the data', data);
		if (data) {
			const currentRate = data.latest.close;
			saveCurrentRate(currentRate).then(sendCurrentRate);
		}
	})
	.catch(console.error);

chrome.runtime.onMessage.addListener(onMessage);
