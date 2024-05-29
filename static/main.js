import * as base64 from './base64.js';
import * as gzip from './gzip.js';

var encode = async function(text) {
	var encoder = new TextEncoder();
	var bytes = encoder.encode(text);
	return base64.encode(await gzip.compress(bytes));
};

var decode = async function(string) {
	var decoder = new TextDecoder();
	var bytes = await gzip.decompress(base64.decode(string));
	return decoder.decode(bytes);
};

var textarea = document.querySelector('textarea');

decode(location.hash.substr(1)).then(text => {
	textarea.value = text;
});

textarea.addEventListener('input', event => {
	encode(textarea.value).then(data => {
		history.replaceState(null, '', `#${data}`);
	});
});
