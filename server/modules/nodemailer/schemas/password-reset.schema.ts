import { Schema } from "mongoose";

import { hideSchemaProperty } from "~common/utils/hideSchemaProperty";

import ms = require("ms");

export const PasswordResetSchema = new Schema(
  {
    created_at: {
      default: (): Date => new Date(),
      expires: ms("3h") / 1000,
      type: Date
    },
    token: {
      maxlength: 64,
      minlength: 64,
      required: true,
      type: String,
      unique: true
    },
    uid: {
      maxlength: 16,
      minlength: 16,
      required: true,
      type: String
    }
  },
  {
    toJSON: {
      transform: hideSchemaProperty(["_id", "__v"])
    },
    toObject: {
      transform: hideSchemaProperty(["_id", "__v"])
    }
  }
);
