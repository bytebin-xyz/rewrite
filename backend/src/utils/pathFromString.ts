import path from "path";

import { chunk } from "@/utils/chunk";

// 26c309b65516403b => "26/c3/09/b6/55/16/40/3"
export const pathFromString = (filename: string, depth = -1): string =>
  chunk.string(path.parse(filename).name.slice(0, depth), 2).join(path.sep);
