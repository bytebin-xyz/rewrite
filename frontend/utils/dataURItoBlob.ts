export const dataURItoBlob = (dataURI: string, filename: string, mimeType: string) =>
  fetch(dataURI)
    .then((res) => res.blob())
    .then((blob) => new File([blob], filename, { type: mimeType }));
