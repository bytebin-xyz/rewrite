import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { plainToClass } from "class-transformer";

import { FileDto } from "../dto/file.dto";

import { Folder } from "@/modules/folders/schemas/folder.schema";

import { PATH_SAFE_REGEX } from "@/validators/is-string-path-safe.validator";

@Schema({
  id: false,
  timestamps: true
})
export class File extends Document implements FileDto {
  createdAt!: Date;

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

  @Prop()
  folder!: string | null;

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
    unique: true
  })
  path!: string;

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

  updatedAt!: Date;

  toDto!: () => FileDto;
}

export const FileSchema = SchemaFactory.createForClass(File);

FileSchema.pre<File>("save", async function(next) {
  if (!this.isNew || (!this.isModified("filename") && !this.isModified("folder"))) return next();

  const folder = this.folder
    ? await this.model<Folder>(Folder.name)
        .findOne({ id: this.folder, uid: this.uid })
        .catch(error => next(error))
    : null;

  this.path = folder ? `${folder.path}/${this.filename}` : `/${this.filename}`;

  next();
});

FileSchema.methods.toDto = function(this: File): FileDto {
  return plainToClass(FileDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
