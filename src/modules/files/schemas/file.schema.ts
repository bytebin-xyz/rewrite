import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";

import { plainToClass } from "class-transformer";

import { FileDto } from "../dto/file.dto";

import { FileTypes } from "../enums/file-types.enum";

import { IsStringPathSafeConstraint } from "@/validators/is-string-path-safe.validator";

import { generateId } from "@/utils/generateId";

@Schema({
  id: false,
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
})
export class File extends Document implements FileDto {
  @Prop(
    raw({
      canAddChildren: {
        default: false,
        type: Boolean
      },

      canCopy: {
        default: true,
        type: Boolean
      },

      canDelete: {
        default: true,
        type: Boolean
      },

      canDownload: {
        default: true,
        type: Boolean
      },

      canMove: {
        default: true,
        type: Boolean
      },

      canRemoveChildren: {
        default: false,
        type: Boolean
      },

      canRename: {
        default: true,
        type: Boolean
      },

      canShare: {
        default: true,
        type: Boolean
      }
    })
  )
  capabilities!: FileDto["capabilities"];

  createdAt!: Date;

  @Prop({
    lowercase: true,
    trim: true,
    unique: true
  })
  id!: string;

  @Prop({
    maxlength: 255,
    required: true,
    trim: true,
    validate: (value: string) => IsStringPathSafeConstraint.validate(value)
  })
  name!: string;

  @Prop({
    default: null,
    lowercase: true,
    trim: true,
    type: String
  })
  parent!: string | null;

  path!: string;

  @Prop({
    default: 0,
    min: 0
  })
  size!: number;

  @Prop(
    raw({
      isDeleted: {
        default: false,
        index: true,
        type: Boolean
      }
    })
  )
  state!: FileDto["state"];

  @Prop({
    enum: Object.values(FileTypes),
    required: true,
    type: String
  })
  type!: FileTypes;

  @Prop({
    lowercase: true,
    required: true,
    trim: true
  })
  uid!: string;

  updatedAt!: Date;

  @Prop({
    default: null,
    index: true,
    type: String
  })
  writtenTo!: string | null;

  toDto!: () => FileDto;
}

export const FileSchema = SchemaFactory.createForClass(File);

FileSchema.index({ name: 1, parent: 1, uid: 1 }, { unique: true });

FileSchema.virtual("path").get(function (this: File) {
  return this.parent ? `${this.parent}/${this.name}` : `/${this.name}`;
});

FileSchema.pre<File>("save", function (next) {
  if (!this.isNew) return next();

  generateId(8)
    .then((id) => {
      this.id = id;
      next();
    })
    .catch((error) => next(error));
});

FileSchema.methods.toDto = function (this: File): FileDto {
  return plainToClass(FileDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
