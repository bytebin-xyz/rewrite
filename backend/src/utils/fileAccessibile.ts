import fs from "fs";

export const fileAccessibile = (path: fs.PathLike): Promise<boolean> =>
  fs.promises
    .access(path)
    .then(() => true)
    .catch(() => false);
