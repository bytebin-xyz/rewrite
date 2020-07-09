import path from "path";

export const pathFromDate = (root: string, date = new Date()): string => {
  if (!path.isAbsolute(root)) throw new Error("Root directory must be an absolute path!");

  const hierarchy = [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ];

  return path.join(root, path.normalize(hierarchy.join("/")));
};
