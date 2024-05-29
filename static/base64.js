var table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export var encode = function(bytes) {
	var result = '';
	var push = x => result += table.charAt(x & 0b111111);
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
};

export var decode = function(string) {
	var result = [];
	for (let i = 0; i < string.length; i += 4) {
		var e1 = table.indexOf(string[i]);
		var e2 = table.indexOf(string[i + 1]);
		var e3 = table.indexOf(string[i + 2]);
		var e4 = table.indexOf(string[i + 3]);

		result.push((e1 << 2) | (e2 >> 4));
		if (e3 !== -1) result.push((e2 << 4) | (e3 >> 2));
		if (e4 !== -1) result.push((e3 << 6) | e4);
	}
	// will truncate the values automatically
	return new Uint8Array(result);
};
