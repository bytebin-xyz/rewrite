import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { plainToClass } from "class-transformer";

import { FileDto } from "../dto/file.dto";

import { generateId } from "@/utils/generateId";

@Schema({
  id: false,
  timestamps: true
})
export class File extends Document implements FileDto {
  createdAt!: Date;
  updatedAt!: Date;

  @Prop({
    maxlength: 255,
    required: true,
    trim: true
  })
  filename!: string;

  // Automatically generated in pre save hook.
  @Prop({
    lowercase: true,
    maxlength: 32,
    minlength: 32,
    trim: true,
    unique: true
  })
  id!: string;

  @Prop({
    required: true,
    trim: true
  })
  partialPath!: string;

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
  rename!: (newFilename: string) => Promise<this>;
}

export const FileSchema = SchemaFactory.createForClass(File);

FileSchema.pre<File>("save", function(next) {
  if (!this.isNew) return next();

  generateId(16)
    .then(id => {
      this.id = id;
      next();
    })
    .catch(error => next(error));
});

FileSchema.methods.toDto = function(this: File): FileDto {
  return plainToClass(FileDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};

FileSchema.methods.rename = async function(this: File, newFilename: string): Promise<File> {
  if (this.filename !== newFilename) {
    this.filename = newFilename;
    await this.save();
  }

  return this;
};
