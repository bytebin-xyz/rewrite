import { Schema } from "mongoose";

import { UserActivation } from "../../nodemailer/interfaces/user-activation.interface";

import { hideSchemaProperty } from "~common/utils/hideSchemaProperty";

import ms = require("ms");

const MAX_RESEND_ATTEMPTS = 5;

export const UserActivationSchema = new Schema(
  {
    created_at: {
      default: (): Date => new Date(),
      expires: ms("3d") / 1000,
      type: Date
    },
    times_resent: {
      default: 0,
      max: MAX_RESEND_ATTEMPTS,
      min: 0,
      type: Number
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
      type: String,
      unique: true
    }
  },
  {
    id: false,
    toJSON: {
      transform: hideSchemaProperty(["_id", "__v"]),
      virtuals: true
    },
    toObject: {
      transform: hideSchemaProperty(["_id", "__v"]),
      virtuals: true
    }
  }
);

UserActivationSchema.methods.resent = function () {
  this.times_resent += 1;
  return this.save();
};

UserActivationSchema.virtual("resendAttemptsExceeded").get(function (
  this: UserActivation
) {
  return this.times_resent >= MAX_RESEND_ATTEMPTS;
});
