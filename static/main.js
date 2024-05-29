import * as crypto from './crypto.js';

var password = window.prompt('Please enter the password');
var key = await crypto.getKey(password);

var textarea = document.querySelector('textarea');

if (location.hash.length) {
	try {
		textarea.value = await crypto.decryptText(location.hash.substr(1), key);
	} catch (e) {
		window.confirm('Decryption failed');
		console.exception(e);
	}
}

textarea.addEventListener('input', async () => {
	var data = await crypto.encryptText(textarea.value, key);
	history.replaceState(null, '', `#${data}`);
});
