let _currentRate;

const RATE_API = 'https://fantasy-vue.herokuapp.com/api/crypto/rate?symbol=ETH-USD';

const getJSON = () => new Promise((resolve, reject) => {
	fetch(RATE_API)
		.then(res => res.json())
		.then(resolve)
		.catch(reject);
});

const sendCurrentRate = (rate) => {
	const query = {
		active: true,
		currentWindow: true
	};

	const msg = {
		rate,
		type: 'set:rate'
	};

	chrome.tabs.query(query, (tabs) => {
		  chrome.tabs.sendMessage(tabs[0].id, msg);
	});
};

// Message handler
const onMessage = (req, sender, sendResp) => {
	if (req.type === 'get:rate') {
		sendResp(_currentRate);
	}
};

getJSON()
	.then((data) => {
		console.log('got the data', data);
		if (data) {
			_currentRate = data.latest.close;
			sendCurrentRate(_currentRate);
		}
	})
	.catch(console.error);


chrome.runtime.onMessage.addListener(onMessage);
