var b64table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export function b64encode(bytes) {
	var result = '';
	var push = x => result += b64table.charAt(x & 0b111111);
	for (let i = 0; i < bytes.length; i += 3) {
		var b1 = bytes[i];
		var b2 = bytes[i + 1];
		var b3 = bytes[i + 2];

		push(b1 >> 2);
		push((b1 << 4) | (b2 >> 4));
		if (!isNaN(b2)) push((b2 << 2) | (b3 >> 6));
		if (!isNaN(b3)) push(b3);
	}
	return result;
}

export function b64decode(string) {
	var result = [];
	for (let i = 0; i < string.length; i += 4) {
		var e1 = b64table.indexOf(string[i]);
		var e2 = b64table.indexOf(string[i + 1]);
		var e3 = b64table.indexOf(string[i + 2]);
		var e4 = b64table.indexOf(string[i + 3]);

		result.push((e1 << 2) | (e2 >> 4));
		if (e3 !== -1) result.push((e2 << 4) | (e3 >> 2));
		if (e4 !== -1) result.push((e3 << 6) | e4);
	}
	// will truncate the values automatically
	return new Uint8Array(result);
}

async function applyStream(bytes, stream) {
	var readableStream = new ReadableStream({
		start(controller) {
			controller.enqueue(bytes);
			controller.close();
		}
	});
	var resultStream = await readableStream.pipeThrough(stream);
	var result = await new Response(resultStream).arrayBuffer();
	return new Uint8Array(result);
}

export async function compress(bytes) {
	return await applyStream(bytes, new CompressionStream('gzip'));
}

export async function decompress(bytes) {
	return await applyStream(bytes, new DecompressionStream('gzip'));
}

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

export async function encodeText(text, key) {
	var encoder = new TextEncoder();
	var bytes = encoder.encode(text);
	bytes = await compress(bytes);
	if (key) {
		bytes = await encrypt(bytes, key);
	}
	return b64encode(bytes);
}

export async function decodeText(string, key) {
	var decoder = new TextDecoder();
	var bytes = b64decode(string);
	if (key) {
		bytes = await decrypt(bytes, key);
	}
	bytes = await decompress(bytes);
	return decoder.decode(bytes);
}
