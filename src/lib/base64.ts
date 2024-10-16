export const bufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  const len = buffer.byteLength;
  let binary = "";
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const base64ToBuffer = (buf: string) => {
  const binary = atob(buf);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < buffer.byteLength; i++) {
    bytes[i] = binary.charCodeAt(i) & 0xff;
  }
  return buffer;
};
