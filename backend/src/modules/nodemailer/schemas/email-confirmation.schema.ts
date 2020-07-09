import ms from "ms";

import { isEmail } from "class-validator";

import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { generateId } from "@/utils/generateId";
import { hideSchemaProperty } from "@/utils/hideSchemaProperty";

@Schema({
  timestamps: true,
  toJSON: {
    transform: hideSchemaProperty(["_id", "__v"])
  },
  toObject: {
    transform: hideSchemaProperty(["_id", "__v"])
  }
})
export class EmailConfirmation extends Document {
  createdAt!: Date;
  updatedAt!: Date;

  @Prop({
    default: () => new Date(Date.now() + ms("3d")),
    expires: 0
  })
  expiresAt!: Date;

  @Prop({
    lowercase: true,
    required: true,
    trim: true,
    validate: isEmail
  })
  newEmail!: string;

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

export const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);

EmailConfirmationSchema.pre<EmailConfirmation>("save", function(next) {
  if (!this.isNew) return next();

  generateId(32)
    .then(token => {
      this.token = token;
      next();
    })
    .catch(next);
});