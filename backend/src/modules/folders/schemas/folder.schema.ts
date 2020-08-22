import { Document, Types } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { plainToClass } from "class-transformer";

import { FolderDto } from "../dto/folder.dto";

import { generateId } from "@/utils/generateId";

@Schema({
  id: false,
  timestamps: true
})
export class Folder extends Document implements FolderDto {
  createdAt!: Date;
  updatedAt!: Date;

  @Prop({
    default: false
  })
  hidden!: boolean;

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
    trim: true
  })
  name!: string;

  @Prop({
    ref: Folder.name,
    type: Types.ObjectId
  })
  parent!: Folder | Types.ObjectId | null;

  @Prop({
    default: false
  })
  public!: boolean;

  @Prop({
    lowercase: true,
    maxlength: 16,
    minlength: 16,
    required: true,
    trim: true
  })
  uid!: string;

  toDto!: () => FolderDto;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);

FolderSchema.pre<Folder>("find", function(this: Folder) {
  this.populate("parent");
});

FolderSchema.pre<Folder>("findOne", function(this: Folder) {
  this.populate("parent");
});

FolderSchema.pre<Folder>("save", function(next) {
  if (!this.isNew) return next();

  generateId(8)
    .then(id => {
      this.id = id;
      next();
    })
    .catch(error => next(error));
});

FolderSchema.post("save", function(doc, next) {
  doc
    .populate("parent")
    .execPopulate()
    .then(() => next())
    .catch(error => next(error));
});

FolderSchema.methods.toDto = function(this: Folder): FolderDto {
  return plainToClass(FolderDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
