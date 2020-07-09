export interface ReadFileResult {
  event: ProgressEvent<FileReader>;
  result: string;
}

export const readFile = (blob: Blob) =>
  new Promise<ReadFileResult>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("An error has occurred while reading the file."));

    reader.onload = (event) => {
      if (!reader.result) reject(new Error("No file result loaded!"));
      else resolve({ event, result: reader.result.toString() });
    };

    reader.readAsDataURL(blob);
  });
