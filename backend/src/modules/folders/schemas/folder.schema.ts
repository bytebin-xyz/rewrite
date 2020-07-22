import { isAlphanumeric } from "class-validator";

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
export class Folder extends Document {
  createdAt!: Date;
  updatedAt!: Date;

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
    maxlength: 255,
    required: true,
    trim: true,
    validate: isAlphanumeric
  })
  name!: string;

  @Prop({
    lowercase: true,
    maxlength: 16,
    minlength: 16,
    required: true,
    trim: true
  })
  uid!: string;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);

FolderSchema.pre<Folder>("save", function(next) {
  if (!this.isNew) return next();

  generateId(8)
    .then(id => {
      this.id = id;
      next();
    })
    .catch(error => next(error));
});
