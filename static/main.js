import * as base64 from './base64.js';
import * as crypto from './crypto.js';
import * as gzip from './gzip.js';

var password = window.prompt('Please enter the password');
var key = await crypto.getKey(password);

var encode = async function(text) {
	var encoder = new TextEncoder();
	var bytes = encoder.encode(text);
	bytes = await gzip.compress(bytes);
	bytes = await crypto.encrypt(bytes, key);
	return base64.encode(bytes);
};

var decode = async function(string) {
	var decoder = new TextDecoder();
	var bytes = base64.decode(string);
	bytes = await crypto.decrypt(bytes, key);
	bytes = await gzip.decompress(bytes);
	return decoder.decode(bytes);
};

var textarea = document.querySelector('textarea');

if (location.hash.length) {
	try {
		textarea.value = await decode(location.hash.substr(1));
	} catch (e) {
		window.confirm('Decryption failed');
		console.exception(e);
	}
}

textarea.addEventListener('input', async () => {
	var data = await encode(textarea.value);
	history.replaceState(null, '', `#${data}`);
});
