import * as crypto from './crypto.js';

var params = new URLSearchParams(location.search);

var password = window.prompt('Please enter the password');
var key = await crypto.getKey(password);

var textarea = document.querySelector('textarea');

if (location.hash.length) {
	try {
		var plaintext = await crypto.decryptText(location.hash.substr(1), key);
		if (params.has('view')) {
			document.write(plaintext);
			document.close();
		} else {
			textarea.value = plaintext;
		}
	} catch (e) {
		window.confirm('Decryption failed');
		console.exception(e);
	}
}

textarea.addEventListener('input', async () => {
	var data = await crypto.encryptText(textarea.value, key);
	history.replaceState(null, '', `#${data}`);
});
