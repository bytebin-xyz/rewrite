import crypto from "crypto";

import { PassThrough, TransformCallback } from "stream";

export interface MD5Passthrough {
  hash: crypto.Hash;
  passthrough: PassThrough;
}

export const calculateMD5 = {
  createPassthrough(): MD5Passthrough {
    const md5 = crypto.createHash("md5");
    const passthrough = new PassThrough({
      transform(chunk: Buffer, _encoding: string, callback: TransformCallback) {
        md5.update(chunk);
        callback(null, chunk);
      }
    });

    return {
      hash: md5,
      passthrough
    };
  },

  fromBuffer(buffer: Buffer): string {
    return crypto
      .createHash("md5")
      .update(buffer)
      .digest("hex");
  }
};
