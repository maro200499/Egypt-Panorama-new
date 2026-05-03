const fs = require('fs');
const path = require('path');
const lamejs = require('lamejs/src/js/index.js');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readWav(filePath) {
  const buffer = fs.readFileSync(filePath);

  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    fail('Input file is not a valid WAV file');
  }

  let format = null;
  let channels = null;
  let sampleRate = null;
  let bitsPerSample = null;
  let dataOffset = null;
  let dataSize = null;

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkDataOffset = offset + 8;

    if (chunkId === 'fmt ') {
      format = buffer.readUInt16LE(chunkDataOffset);
      channels = buffer.readUInt16LE(chunkDataOffset + 2);
      sampleRate = buffer.readUInt32LE(chunkDataOffset + 4);
      bitsPerSample = buffer.readUInt16LE(chunkDataOffset + 14);
    } else if (chunkId === 'data') {
      dataOffset = chunkDataOffset;
      dataSize = chunkSize;
    }

    offset = chunkDataOffset + chunkSize + (chunkSize % 2);
  }

  if (format !== 1) {
    fail('Only PCM WAV files are supported');
  }

  if (!channels || !sampleRate || bitsPerSample !== 16 || dataOffset === null || dataSize === null) {
    fail('Unsupported WAV format');
  }

  const sampleCount = dataSize / (bitsPerSample / 8) / channels;
  const monoSamples = new Int16Array(sampleCount);

  let sampleIndex = 0;
  for (let i = dataOffset; i < dataOffset + dataSize; i += (bitsPerSample / 8) * channels) {
    let total = 0;
    for (let channel = 0; channel < channels; channel++) {
      total += buffer.readInt16LE(i + channel * 2);
    }
    monoSamples[sampleIndex++] = Math.max(-32768, Math.min(32767, Math.round(total / channels)));
  }

  return { sampleRate, monoSamples };
}

function encodeToMp3(inputWav, outputMp3) {
  const { sampleRate, monoSamples } = readWav(inputWav);
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
  const chunks = [];
  const blockSize = 1152;

  for (let i = 0; i < monoSamples.length; i += blockSize) {
    const chunk = monoSamples.subarray(i, i + blockSize);
    const mp3Chunk = encoder.encodeBuffer(chunk);
    if (mp3Chunk.length > 0) {
      chunks.push(Buffer.from(mp3Chunk));
    }
  }

  const finalChunk = encoder.flush();
  if (finalChunk.length > 0) {
    chunks.push(Buffer.from(finalChunk));
  }

  fs.mkdirSync(path.dirname(outputMp3), { recursive: true });
  fs.writeFileSync(outputMp3, Buffer.concat(chunks));
}

const [,, inputWav, outputMp3] = process.argv;

if (!inputWav || !outputMp3) {
  fail('Usage: node encode_wave_to_mp3.js <input.wav> <output.mp3>');
}

try {
  encodeToMp3(inputWav, outputMp3);
} catch (error) {
  fail(error instanceof Error ? (error.stack || error.message) : 'MP3 encoding failed');
}
