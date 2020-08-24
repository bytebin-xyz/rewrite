import { Document, Types } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { plainToClass } from "class-transformer";

import { FileDto } from "../dto/file.dto";

import { FolderDto } from "@/modules/folders/dto/folder.dto";

import { Folder } from "@/modules/folders/schemas/folder.schema";

import { PATH_SAFE_REGEX } from "@/validators/is-string-path-safe.validator";

@Schema({
  id: false,
  timestamps: true
})
export class File extends Document implements FileDto {
  createdAt!: Date;
  updatedAt!: Date;

  @Prop({
    default: true
  })
  deletable!: boolean;

  @Prop({
    maxlength: 255,
    required: true,
    trim: true,
    validate: (value: string) => !PATH_SAFE_REGEX.test(value)
  })
  filename!: string;

  @Prop({
    ref: Folder.name,
    type: Types.ObjectId
  })
  folder!: FolderDto | Types.ObjectId | null;

  @Prop({
    default: false
  })
  hidden!: boolean;

  @Prop({
    lowercase: true,
    maxlength: 16,
    minlength: 16,
    required: true,
    trim: true,
    unique: true
  })
  id!: string;

  @Prop({
    default: false
  })
  public!: boolean;

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

  toDto!: () => FileDto;
}

export const FileSchema = SchemaFactory.createForClass(File);

FileSchema.pre<File>("find", function() {
  this.populate("folder");
});

FileSchema.pre<File>("findOne", function() {
  this.populate("folder");
});

FileSchema.post<File>("save", function(doc, next) {
  doc
    .populate("folder")
    .execPopulate()
    .then(() => next())
    .catch(error => next(error));
});

FileSchema.methods.toDto = function(this: File): FileDto {
  return plainToClass(FileDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
