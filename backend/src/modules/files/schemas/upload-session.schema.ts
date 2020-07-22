import ms from "ms";

import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { generateId } from "@/utils/generateId";
import { hideSchemaProperty } from "@/utils/hideSchemaProperty";

@Schema({
  id: false,
  timestamps: true,
  toJSON: {
    transform: hideSchemaProperty(["_id", "__v"])
  },
  toObject: {
    transform: hideSchemaProperty(["_id", "__v"])
  }
})
export class UploadSession extends Document {
  createdAt!: Date;
  updatedAt!: Date;

  @Prop({
    default: 5 * 1024 * 1024,
    min: 1
  })
  chunkSize!: number;

  @Prop({
    min: 1,
    required: true
  })
  chunksTotal!: number;

  @Prop({
    default: 0,
    min: 0
  })
  chunksUploaded!: number;

  @Prop({
    default: (): Date => new Date()
  })
  commitedAt!: Date;

  @Prop({
    default: () => new Date(Date.now() + ms("2d")),
    expires: 0
  })
  expiresAt!: Date;

  @Prop({
    maxlength: 255,
    required: true,
    trim: true
  })
  filename!: string;

  // Automatically generated in pre save hook.
  @Prop({
    lowercase: true,
    maxlength: 16,
    minlength: 16,
    trim: true,
    unique: true
  })
  id!: string;

  @Prop({
    min: 1,
    required: true
  })
  size!: number;

  @Prop({
    lowercase: true,
    maxlength: 16,
    minlength: 16,
    required: true,
    trim: true
  })
  uid!: string;
}

export const UploadSessionSchema = SchemaFactory.createForClass(UploadSession);

UploadSessionSchema.pre<UploadSession>("save", function(next) {
  if (!this.isNew) return next();

  generateId(8)
    .then(id => {
      this.id = id;
      next();
    })
    .catch(error => next(error));
});
