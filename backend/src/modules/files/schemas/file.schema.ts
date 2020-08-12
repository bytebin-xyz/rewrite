import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";

import { plainToClass } from "class-transformer";

import { FileDto } from "../dto/file.dto";

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

  @Prop(
    raw({
      default: null,
      trim: true,
      type: String
    })
  )
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

FileSchema.methods.toDto = function(this: File): FileDto {
  return plainToClass(FileDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
