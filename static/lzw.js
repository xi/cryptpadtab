class Buffer {
	constructor(bytes) {
		this.bytes = bytes;
		this.i_byte = 0;
		this.i_bit = 0;
	}

	next() {
		if (this.i_bit < 7) {
			this.i_bit += 1;
		} else {
			this.i_byte += 1;
			this.i_bit = 0;
		}
	}

	read(size) {
		var bits = 0;
		for (let i = 0; i < size; i++) {
			if (this.bytes.length <= this.i_byte) {
				throw new RangeError();
			}
			bits <<= 1;
			if (this.bytes[this.i_byte] & (1 << (7 - this.i_bit))) {
				bits |= 1;
			}
			this.next();
		}
		return bits;
	}

	write(bits, size) {
		for (let i = 0; i < size; i++) {
			if (this.bytes.length <= this.i_byte) {
				this.bytes.push(0);
			}
			if (bits & (1 << (size - i - 1))) {
				this.bytes[this.i_byte] |= 1 << (7 - this.i_bit);
			}
			this.next();
		}
	}
}

var sIndexOf = function(dict, value) {
	var s = value.toString();
	for (let i = 0; i < dict.length; i++) {
		if (s === dict[i].toString()) {
			return i;
		}
	}
	return -1;
};

export var compress = function(bytes) {
	var result = [];
	var buf = new Buffer(result);

	var field_size = 9;
	var dict = [];
	dict.push('end');
	for (let i = 0; i < 256; i++) {
		dict.push([i]);
	}

	var win = [];
	var i = 0;
	while (i < bytes.length) {
		var tmp = [...win, bytes[i]];
		if (sIndexOf(dict, tmp) === -1) {
			buf.write(sIndexOf(dict, win), field_size);
			win = [];
			if (dict.length >> field_size) {
				field_size += 1;
			}
			dict.push(tmp);
		} else {
			win = tmp;
			i += 1;
		}
	}
	buf.write(sIndexOf(dict, win), field_size);
	buf.write(sIndexOf(dict, 'end'), field_size);

	return new Uint8Array(result);
};

export var decompress = function(bytes) {
	var result = [];
	var buf = new Buffer(bytes);
	var prev = null;

	var field_size = 9;
	var dict = [];
	dict.push('end');
	for (let i = 0; i < 256; i++) {
		dict.push([i]);
	}

	while (true) {
		var index = buf.read(field_size);
		var value = dict[index];
		if (dict.length >> field_size) {
			field_size += 1;
		}

		if (value === 'end') {
			break;
		}

		// push to dict with one cycle delay because we need the first
		// item from the next entry.
		//
		// If value is undefined, the next entry is the not-yet-pushed one.
		// Fortunately, we know that its first item is the same as in the entry
		// before that.
		if (!value) {
			value = [...prev, prev[0]];
		}
		result = result.concat(value);
		if (prev) {
			dict.push([...prev, value[0]]);
		}
		prev = value;
	}

	return new Uint8Array(result);
};
