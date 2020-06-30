import { isEmail } from "class-validator";

import { Schema } from "mongoose";

import { hideSchemaProperty } from "~common/utils/hideSchemaProperty";

import ms = require("ms");

export const EmailConfirmationSchema = new Schema(
  {
    created_at: {
      default: () => new Date(),
      type: Date
    },
    expires_at: {
      default: () => new Date(Date.now() + ms("3d")),
      expires: 0,
      type: Date
    },
    new_email: {
      required: true,
      set: (value: string) => value.toLowerCase(),
      type: String,
      validate: {
        validator: isEmail
      }
    },
    token: {
      maxlength: 64,
      minlength: 64,
      required: true,
      set: (value: string) => value.toLowerCase(),
      type: String,
      unique: true
    },
    uid: {
      maxlength: 16,
      minlength: 16,
      required: true,
      set: (value: string) => value.toLowerCase(),
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
