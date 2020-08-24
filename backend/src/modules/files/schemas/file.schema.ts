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
    index: true
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

  populateFolder!: () => Promise<Folder | null>;
  toDto!: () => FileDto;
}

export const FileSchema = SchemaFactory.createForClass(File);

FileSchema.pre<File>("find", function() {
  this.populate("folder");
});

FileSchema.pre<File>("findOne", function() {
  this.populate("folder");
});

FileSchema.pre<File>("save", async function(next) {
  if (!this.isModified("filename") && !this.isModified("folder")) return next();

  try {
    const folder = await this.populateFolder();

    this.path = folder ? folder.path + this.filename : `/${this.filename}`;

    next();
  } catch (error) {
    next(error);
  }
});

FileSchema.post<File>("save", function(doc, next) {
  doc
    .populateFolder()
    .then(() => next())
    .catch(error => next(error));
});

FileSchema.methods.populateFolder = async function(this: File): Promise<Folder | null> {
  await this.populate("folder").execPopulate();

  return this.folder as Folder | null;
};

FileSchema.methods.toDto = function(this: File): FileDto {
  return plainToClass(FileDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
