function mergeFloat32Arrays(chunks) {
  const totalLength = chunks.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Float32Array(totalLength);
  let offset = 0;
  for (const arr of chunks) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function pcmToWav(pcmData, sampleRate = 16000) {
  const numOfChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numOfChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + pcmData.length * bytesPerSample);
  const view = new DataView(buffer);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  let offset = 0;
  writeString(offset, "RIFF");
  offset += 4;
  view.setUint32(offset, 36 + pcmData.length * bytesPerSample, true);
  offset += 4;
  writeString(offset, "WAVE");
  offset += 4;
  writeString(offset, "fmt ");
  offset += 4;
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, numOfChannels, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * blockAlign, true);
  offset += 4;
  view.setUint16(offset, blockAlign, true);
  offset += 2;
  view.setUint16(offset, 8 * bytesPerSample, true);
  offset += 2;
  writeString(offset, "data");
  offset += 4;
  view.setUint32(offset, pcmData.length * bytesPerSample, true);
  offset += 4;

  const volume = 1;
  let index = offset;
  for (let i = 0; i < pcmData.length; i++, index += 2) {
    const s = pcmData[i];
    view.setInt16(index, s, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export { pcmToWav, mergeFloat32Arrays };
