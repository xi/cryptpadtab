export async function compress(bytes) {
	var compressionStream = new CompressionStream('gzip');
	var writableStream = new WritableStream();
	var readableStream = new ReadableStream({
		start(controller) {
			controller.enqueue(bytes);
			controller.close();
		}
	});
	await readableStream.pipeThrough(compressionStream).pipeTo(writableStream);
	var result = await new Response(writableStream).arrayBuffer();
	return new Uint8Array(result);
}

export async function decompress(bytes) {
	var decompressionStream = new DecompressionStream('gzip');
	var writableStream = new WritableStream();
	var readableStream = new ReadableStream({
		start(controller) {
			controller.enqueue(bytes);
			controller.close();
		}
	});
	await readableStream.pipeThrough(decompressionStream).pipeTo(writableStream);
	var result = await new Response(writableStream).arrayBuffer();
	return new Uint8Array(result);
}
