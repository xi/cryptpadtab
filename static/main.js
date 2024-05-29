import * as base64 from './base64.js';

var encode = function(text) {
	var encoder = new TextEncoder();
	var bytes = encoder.encode(text);
	return base64.encode(bytes);
};

var decode = function(string) {
	var decoder = new TextDecoder();
	var bytes = base64.decode(string);
	return decoder.decode(bytes);
};

var textarea = document.querySelector('textarea');

try {
	textarea.value = decode(location.hash.substr(1));
} catch (e) {
	console.exception(e);
}

textarea.addEventListener('input', event => {
	history.replaceState(null, '', '#' + encode(textarea.value));
});
