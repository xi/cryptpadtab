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
