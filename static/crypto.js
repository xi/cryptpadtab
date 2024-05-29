export async function getKey(password) {
	var encoder = new TextEncoder();
	var encoded = encoder.encode(password);
	var hashed = await crypto.subtle.digest('SHA-256', encoded);
	return await crypto.subtle.importKey(
		'raw', hashed, 'AES-GCM', false, ['encrypt', 'decrypt'],
	);
}

export async function encrypt(bytes, key) {
	var iv = crypto.getRandomValues(new Uint8Array(12));
	var encrypted = new Uint8Array(await crypto.subtle.encrypt(
		{name: 'AES-GCM', iv: iv}, key, bytes
	));

	var result = new Uint8Array(iv.length + encrypted.length);
	result.set(iv, 0);
	result.set(encrypted, iv.length);
	return result;
}

export async function decrypt(bytes, key) {
	var iv = bytes.slice(0, 12);
	var encrypted = bytes.slice(12);

	return new Uint8Array(await crypto.subtle.decrypt(
		{name: 'AES-GCM', iv: iv}, key, encrypted
	));
}
