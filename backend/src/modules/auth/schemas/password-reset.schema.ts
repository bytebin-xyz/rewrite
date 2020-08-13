import ms from "ms";

import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { generateId } from "@/utils/generateId";

@Schema({
  timestamps: true
})
export class PasswordReset extends Document {
  createdAt!: Date;
  updatedAt!: Date;

  @Prop({
    default: () => new Date(Date.now() + ms("1h")),
    expires: 0
  })
  expiresAt!: Date;

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
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);

PasswordResetSchema.pre<PasswordReset>("save", function(next) {
  if (!this.isNew) return next();

  generateId(32)
    .then(token => {
      this.token = token;
      next();
    })
    .catch(error => next(error));
});
