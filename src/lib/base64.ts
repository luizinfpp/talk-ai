export const bufferToBase64 = (buffer : ArrayBuffer) => {
  var bytes = new Uint8Array(buffer);
  var len = buffer.byteLength;
  var binary = "";
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const base64ToBuffer = (buf : string) => {
  var binary = atob(buf);
  var buffer = new ArrayBuffer(binary.length);
  var bytes = new Uint8Array(buffer);
  for (var i = 0; i < buffer.byteLength; i++) {
      bytes[i] = binary.charCodeAt(i) & 0xFF;
  }
  return buffer;
};