import * as bcrypt from "bcrypt";

import { isAlphanumeric, isEmail } from "class-validator";

import { Schema } from "mongoose";

import { hideSchemaProperty } from "~common/utils/hideSchemaProperty";

import ms = require("ms");

export const UserSchema = new Schema(
  {
    activated: {
      default: false,
      type: Boolean
    },
    created_at: {
      default: (): Date => new Date(),
      type: Date
    },
    display_name: {
      maxlength: 32,
      type: String,
      unique: true,
      validate: {
        validator: isAlphanumeric
      }
    },
    email: {
      type: String,
      unique: true,
      validate: {
        validator: isEmail
      }
    },
    expires_at: {
      default: (): Date => new Date(),
      expires: ms("1d") / 1000,
      type: Date
    },
    password: {
      type: String
    },
    uid: {
      maxlength: 16,
      minlength: 16,
      required: true,
      type: String,
      unique: true
    },
    username: {
      maxlength: 32,
      type: String,
      unique: true,
      validate: {
        validator: isAlphanumeric
      }
    }
  },
  {
    toJSON: {
      transform: hideSchemaProperty(["_id", "__v", "expires_at", "password"])
    },
    toObject: {
      transform: hideSchemaProperty(["_id", "__v", "expires_at", "password"])
    }
  }
);

UserSchema.methods.activate = async function () {
  if (!this.activated || this.expires_at) {
    this.activated = true;
    this.expires_at = null;

    await this.save();
  }
};

UserSchema.methods.changeEmail = async function (newEmail: string) {
  if (this.email === newEmail) return;

  this.email = newEmail;
  await this.save();
};

UserSchema.methods.changePassword = async function (newPassword: string) {
  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  if (this.password === newHashedPassword) return;

  this.password = newHashedPassword;
  await this.save();
};

UserSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};
