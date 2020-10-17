import { FilterQuery } from "mongoose";

import { File } from "../schemas/file.schema";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeleteFileJob extends FilterQuery<File> {}
