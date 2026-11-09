// QR codes made in the page, for the try pages' "Show QR for this look" (assets/try/try.js loads this file the first
// time the button is pressed): text in, an SVG of dark modules on a light ground out, with no library from a CDN.
// A shortened port of Project Nayuki's QR Code generator library (https://www.nayuki.io/page/qr-code-generator-library,
// MIT licence below and in qr.js.LICENSE.txt beside this file): byte mode (UTF-8) only, versions 1 to 40, the error
// correction raised as far as the smallest version that holds the text allows, and the mask with the lowest penalty,
// as the original chooses them.
//
//   VGQR.encode(text, level, mask)  { version, level, mask, size, isDark(x, y) }: level 'L', 'M' (the default), 'Q'
//                                   or 'H', the least it may use; mask 0 to 7, or left out for the best one
//   VGQR.svg(text, options)         the code as <svg> markup, options { level, border (the light margin, in modules;
//                                   4, the standard's), dark, light }: it scales to any size, its modules crisp
//
// Copyright (c) Project Nayuki. (MIT License)
// https://www.nayuki.io/page/qr-code-generator-library
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the following conditions:
// - The above copyright notice and this permission notice shall be included in all copies or substantial portions of
//   the Software.
// - The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to
//   the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the
//   authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract,
//   tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the
//   Software.
(function () {
  'use strict';

  // Each level's row in the tables below and its two format bits.
  var LEVELS = {
    L: { ordinal: 0, formatBits: 1 },
    M: { ordinal: 1, formatBits: 0 },
    Q: { ordinal: 2, formatBits: 3 },
    H: { ordinal: 3, formatBits: 2 }
  };
  var BOOST = ['M', 'Q', 'H'];
  var MAX_VERSION = 40;
  var BYTE_MODE = 0x4;
  var PENALTY_N1 = 3;
  var PENALTY_N2 = 3;
  var PENALTY_N3 = 40;
  var PENALTY_N4 = 10;
  // By level (L, M, Q, H), then by version (index 0 unused).
  var ECC_CODEWORDS_PER_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  ];
  var NUM_ERROR_CORRECTION_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  ];

  var bitOf = function (x, i) { return ((x >>> i) & 1) !== 0; };
  var appendBits = function (value, length, bits) {
    for (var i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };

  // The modules a version has for data and error correction, after its function patterns.
  function rawDataModules(version) {
    var result = (16 * version + 128) * version + 64;
    if (version >= 2) {
      var numAlign = Math.floor(version / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (version >= 7) result -= 36;
    }
    return result;
  }
  function dataCodewords(version, level) {
    return Math.floor(rawDataModules(version) / 8) -
      ECC_CODEWORDS_PER_BLOCK[level.ordinal][version] * NUM_ERROR_CORRECTION_BLOCKS[level.ordinal][version];
  }
  // Byte mode's character count: 8 bits up to version 9, then 16.
  var countBits = function (version) { return version < 10 ? 8 : 16; };

  // Reed-Solomon over GF(2^8/0x11D), its generator's coefficients highest power first, the leading 1 left out.
  function multiply(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }
  function divisor(degree) {
    var result = [];
    for (var i = 0; i < degree - 1; i++) result.push(0);
    result.push(1);
    var root = 1;
    for (var n = 0; n < degree; n++) {
      for (var j = 0; j < result.length; j++) {
        result[j] = multiply(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = multiply(root, 0x02);
    }
    return result;
  }
  function remainder(data, by) {
    var result = by.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ result.shift();
      result.push(0);
      by.forEach(function (coef, i) { result[i] ^= multiply(coef, factor); });
    });
    return result;
  }

  // The symbol of [codewords] (the data, padded) in [version] at [level]: function patterns, error correction
  // interleaved over the blocks, the zigzag of codewords, then the mask.
  function symbol(version, level, codewords, chosenMask) {
    var size = version * 4 + 17;
    var modules = [];
    var isFunction = [];
    for (var r = 0; r < size; r++) {
      modules.push(new Array(size).fill(false));
      isFunction.push(new Array(size).fill(false));
    }
    var set = function (x, y, dark) {
      modules[y][x] = dark;
      isFunction[y][x] = true;
    };

    function formatBits(mask) {
      var data = level.formatBits << 3 | mask;
      var rem = data;
      for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bits = (data << 10 | rem) ^ 0x5412;
      for (i = 0; i <= 5; i++) set(8, i, bitOf(bits, i));
      set(8, 7, bitOf(bits, 6));
      set(8, 8, bitOf(bits, 7));
      set(7, 8, bitOf(bits, 8));
      for (i = 9; i < 15; i++) set(14 - i, 8, bitOf(bits, i));
      for (i = 0; i < 8; i++) set(size - 1 - i, 8, bitOf(bits, i));
      for (i = 8; i < 15; i++) set(8, size - 15 + i, bitOf(bits, i));
      set(8, size - 8, true);
    }
    function versionBits() {
      if (version < 7) return;
      var rem = version;
      for (var i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var bits = version << 12 | rem;
      for (i = 0; i < 18; i++) {
        var dark = bitOf(bits, i);
        var a = size - 11 + i % 3;
        var b = Math.floor(i / 3);
        set(a, b, dark);
        set(b, a, dark);
      }
    }
    function finder(x, y) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var dist = Math.max(Math.abs(dx), Math.abs(dy));
          var xx = x + dx;
          var yy = y + dy;
          if (xx >= 0 && xx < size && yy >= 0 && yy < size) set(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    }
    function alignment(x, y) {
      for (var dy = -2; dy <= 2; dy++) {
        for (var dx = -2; dx <= 2; dx++) set(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
    function alignmentPositions() {
      if (version === 1) return [];
      var numAlign = Math.floor(version / 7) + 2;
      var step = Math.floor((version * 8 + numAlign * 3 + 5) / (numAlign * 4 - 4)) * 2;
      var result = [6];
      for (var pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
      return result;
    }

    // Function patterns: timing, finders, alignment, and room for the format and version bits.
    for (var i = 0; i < size; i++) {
      set(6, i, i % 2 === 0);
      set(i, 6, i % 2 === 0);
    }
    finder(3, 3);
    finder(size - 4, 3);
    finder(3, size - 4);
    var align = alignmentPositions();
    var last = align.length - 1;
    align.forEach(function (ay, row) {
      align.forEach(function (ax, column) {
        var corner = (row === 0 && column === 0) || (row === 0 && column === last) || (row === last && column === 0);
        if (!corner) alignment(ax, ay);
      });
    });
    formatBits(0);
    versionBits();

    // Error correction per block, then the blocks' bytes interleaved.
    var numBlocks = NUM_ERROR_CORRECTION_BLOCKS[level.ordinal][version];
    var blockEccLen = ECC_CODEWORDS_PER_BLOCK[level.ordinal][version];
    var rawCodewords = Math.floor(rawDataModules(version) / 8);
    var numShortBlocks = numBlocks - rawCodewords % numBlocks;
    var shortBlockLen = Math.floor(rawCodewords / numBlocks);
    var rs = divisor(blockEccLen);
    var blocks = [];
    for (var b = 0, k = 0; b < numBlocks; b++) {
      var dat = codewords.slice(k, k + shortBlockLen - blockEccLen + (b < numShortBlocks ? 0 : 1));
      k += dat.length;
      var ecc = remainder(dat, rs);
      if (b < numShortBlocks) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var all = [];
    for (i = 0; i < blocks[0].length; i++) {
      blocks.forEach(function (block, j) {
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) all.push(block[i]);
      });
    }

    // The zigzag, two columns at a time from the right, skipping the vertical timing column.
    var bit = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var c = 0; c < 2; c++) {
          var x = right - c;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - vert : vert;
          if (!isFunction[y][x] && bit < all.length * 8) {
            modules[y][x] = bitOf(all[bit >>> 3], 7 - (bit & 7));
            bit++;
          }
        }
      }
    }

    function applyMask(mask) {
      for (var my = 0; my < size; my++) {
        for (var mx = 0; mx < size; mx++) {
          var invert;
          switch (mask) {
            case 0: invert = (mx + my) % 2 === 0; break;
            case 1: invert = my % 2 === 0; break;
            case 2: invert = mx % 3 === 0; break;
            case 3: invert = (mx + my) % 3 === 0; break;
            case 4: invert = (Math.floor(mx / 3) + Math.floor(my / 2)) % 2 === 0; break;
            case 5: invert = mx * my % 2 + mx * my % 3 === 0; break;
            case 6: invert = (mx * my % 2 + mx * my % 3) % 2 === 0; break;
            default: invert = ((mx + my) % 2 + mx * my % 3) % 2 === 0;
          }
          if (!isFunction[my][mx] && invert) modules[my][mx] = !modules[my][mx];
        }
      }
    }

    // The penalty a masked symbol scores: runs of one colour, 2 x 2 blocks, finder-like patterns, and the balance.
    function addHistory(run, history) {
      if (history[0] === 0) run += size; // the light margin before the first run
      history.pop();
      history.unshift(run);
    }
    function finderLike(history) {
      var n = history[1];
      var core = n > 0 && history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n;
      return (core && history[0] >= n * 4 && history[6] >= n ? 1 : 0) + (core && history[6] >= n * 4 && history[0] >= n ? 1 : 0);
    }
    function endLine(dark, run, history) {
      if (dark) {
        addHistory(run, history);
        run = 0;
      }
      addHistory(run + size, history); // the light margin after the last run
      return finderLike(history);
    }
    function line(at) {
      var score = 0;
      var dark = false;
      var run = 0;
      var history = [0, 0, 0, 0, 0, 0, 0];
      for (var n = 0; n < size; n++) {
        if (at(n) === dark) {
          run++;
          if (run === 5) score += PENALTY_N1;
          else if (run > 5) score++;
        } else {
          addHistory(run, history);
          if (!dark) score += finderLike(history) * PENALTY_N3;
          dark = at(n);
          run = 1;
        }
      }
      return score + endLine(dark, run, history) * PENALTY_N3;
    }
    function penalty() {
      var score = 0;
      var n;
      var row = function (y) { return function (x) { return modules[y][x]; }; };
      var column = function (x) { return function (y) { return modules[y][x]; }; };
      for (n = 0; n < size; n++) score += line(row(n)) + line(column(n));
      for (var py = 0; py < size - 1; py++) {
        for (var px = 0; px < size - 1; px++) {
          var colour = modules[py][px];
          if (colour === modules[py][px + 1] && colour === modules[py + 1][px] && colour === modules[py + 1][px + 1]) score += PENALTY_N2;
        }
      }
      var dark = 0;
      modules.forEach(function (cells) { cells.forEach(function (cell) { if (cell) dark++; }); });
      var total = size * size;
      return score + (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * PENALTY_N4;
    }

    var mask = chosenMask;
    if (mask === undefined || mask === null || mask < 0) {
      var least = Infinity;
      for (var m = 0; m < 8; m++) {
        applyMask(m);
        formatBits(m);
        var score = penalty();
        if (score < least) {
          mask = m;
          least = score;
        }
        applyMask(m); // XOR again: back as it was
      }
    }
    applyMask(mask);
    formatBits(mask);
    return {
      size: size,
      mask: mask,
      isDark: function (x, y) { return x >= 0 && x < size && y >= 0 && y < size && modules[y][x]; }
    };
  }

  function encode(text, levelName, mask) {
    var data = Array.prototype.slice.call(new TextEncoder().encode(String(text)));
    var level = LEVELS[levelName || 'M'];
    if (!level) throw new RangeError('No QR level ' + levelName);
    var version;
    var used;
    for (version = 1; ; version++) {
      used = 4 + countBits(version) + data.length * 8;
      if (used <= dataCodewords(version, level) * 8) break;
      if (version >= MAX_VERSION) throw new RangeError('Too long for a QR code: ' + data.length + ' bytes');
    }
    // More error correction, where the version has room for it.
    BOOST.forEach(function (name) {
      if (used <= dataCodewords(version, LEVELS[name]) * 8) level = LEVELS[name];
    });
    var bits = [];
    appendBits(BYTE_MODE, 4, bits);
    appendBits(data.length, countBits(version), bits);
    data.forEach(function (byte) { appendBits(byte, 8, bits); });
    var capacity = dataCodewords(version, level) * 8;
    appendBits(0, Math.min(4, capacity - bits.length), bits);
    appendBits(0, (8 - bits.length % 8) % 8, bits);
    for (var pad = 0xEC; bits.length < capacity; pad ^= 0xEC ^ 0x11) appendBits(pad, 8, bits);
    var codewords = new Array(bits.length / 8).fill(0);
    bits.forEach(function (b, i) { codewords[i >>> 3] |= b << (7 - (i & 7)); });
    var code = symbol(version, level, codewords, mask);
    code.version = version;
    code.level = Object.keys(LEVELS).filter(function (name) { return LEVELS[name] === level; })[0];
    return code;
  }

  // One path of the dark modules, a run of them in a row as one rectangle.
  function svg(text, options) {
    options = options || {};
    var code = encode(text, options.level);
    var border = options.border == null ? 4 : options.border;
    var full = code.size + border * 2;
    var path = '';
    for (var y = 0; y < code.size; y++) {
      for (var x = 0; x < code.size; x++) {
        if (!code.isDark(x, y)) continue;
        var run = 1;
        while (code.isDark(x + run, y)) run++;
        path += 'M' + (x + border) + ' ' + (y + border) + 'h' + run + 'v1h-' + run + 'z';
        x += run - 1;
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + full + ' ' + full + '" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect width="' + full + '" height="' + full + '" fill="' + (options.light || '#FFFFFF') + '"/>' +
      '<path d="' + path + '" fill="' + (options.dark || '#000000') + '"/></svg>';
  }

  window.VGQR = { encode: encode, svg: svg };
}());
