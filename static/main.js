var textarea = document.querySelector('textarea');

textarea.value = location.hash.substr(1);

textarea.addEventListener('input', event => {
	history.replaceState(null, '', '#' + textarea.value);
});
