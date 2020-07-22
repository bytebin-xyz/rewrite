import ms from "ms";

import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { generateId } from "@/utils/generateId";
import { hideSchemaProperty } from "@/utils/hideSchemaProperty";

const MAX_RESEND_ATTEMPTS = 5;

@Schema({
  timestamps: true,
  toJSON: {
    transform: hideSchemaProperty(["_id", "__v"]),
    virtuals: true
  },
  toObject: {
    transform: hideSchemaProperty(["_id", "__v"]),
    virtuals: true
  }
})
export class UserActivation extends Document {
  createdAt!: Date;
  updatedAt!: Date;

  @Prop({
    default: () => new Date(Date.now() + ms("7d")),
    expires: 0
  })
  expiresAt!: Date;

  @Prop({
    default: 0,
    max: MAX_RESEND_ATTEMPTS,
    min: 0
  })
  times_resent!: number;

  @Prop({
    lowercase: true,
    maxlength: 64,
    minlength: 64,
    trim: true,
    unique: true
  })
  token!: string; // Automatically generated in pre save hook.

  @Prop({
    lowercase: true,
    maxlength: 16,
    minlength: 16,
    required: true,
    trim: true
  })
  uid!: string;

  resent!: () => Promise<void>;
}

export const UserActivationSchema = SchemaFactory.createForClass(UserActivation);

UserActivationSchema.pre<UserActivation>("save", function(next) {
  if (!this.isNew) return next();

  generateId(32)
    .then(token => {
      this.token = token;
      next();
    })
    .catch(error => next(error));
});

UserActivationSchema.methods.resent = async function() {
  this.times_resent += 1;
  await this.save();
};
