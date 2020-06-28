import * as bcrypt from "bcrypt";

import { isAlphanumeric, isEmail } from "class-validator";

import { Schema } from "mongoose";

import { hideSchemaProperty } from "~common/utils/hideSchemaProperty";

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
    deleted: {
      default: false,
      type: Boolean
    },
    display_name: {
      maxlength: 32,
      required: true,
      type: String,
      unique: true,
      validate: {
        validator: isAlphanumeric
      }
    },
    email: {
      required: true,
      type: String,
      unique: true,
      validate: {
        validator: isEmail
      }
    },
    password: {
      required: true,
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
      required: true,
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

UserSchema.methods.changeDisplayName = async function (newDisplayName: string) {
  if (this.display_name === newDisplayName) return;

  this.display_name = newDisplayName;
  await this.save();
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

UserSchema.methods.delete = async function () {
  if (!this.deleted) {
    this.deleted = true;
    this.email = "";

    await this.save();
  }
};
