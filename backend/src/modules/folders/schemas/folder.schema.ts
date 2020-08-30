// TODO: Folder and File schema is too tightly coupled

import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { plainToClass } from "class-transformer";

import { FolderDto } from "../dto/folder.dto";

import { File } from "@/modules/files/schemas/file.schema";

import { generateId } from "@/utils/generateId";

import { PATH_SAFE_REGEX } from "@/validators/is-string-path-safe.validator";

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
export class Folder extends Document implements FolderDto {
  createdAt!: Date;

  deepness!: number;

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
    trim: true,
    validate: (value: string) => !PATH_SAFE_REGEX.test(value)
  })
  name!: string;

  @Prop()
  parent!: string | null;

  @Prop({
    unique: true
  })
  path!: string;

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

  updatedAt!: Date;

  toDto!: () => FolderDto;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);

FolderSchema.pre<Folder>("save", async function(next) {
  if (!this.isNew) return next();

  const folders = this.model<Folder>(Folder.name);

  try {
    const id = await generateId(8);
    const parent = this.parent ? await folders.findOne({ id: this.parent, uid: this.uid }) : null;

    this.id = id;
    this.path = parent ? `${parent.path}/${this.name}` : `/${this.name}`;

    next();
  } catch (error) {
    next(error);
  }
});

FolderSchema.pre<Folder>("save", async function(next) {
  if (this.isNew || (!this.isModified("name") && !this.isModified("parent"))) return next();

  const files = this.model<File>(File.name);
  const folders = this.model<Folder>(Folder.name);

  try {
    const parent = this.parent ? await folders.findOne({ id: this.parent, uid: this.uid }) : null;

    const newPath = parent ? `${parent.path}/${this.name}` : `/${this.name}`;
    const oldPath = this.path.toString();

    const oldPathQuery = { path: { $regex: `^${oldPath}/` }, uid: this.uid };

    this.path = newPath;

    await folders
      .find(oldPathQuery)
      .cursor()
      .eachAsync(async child => {
        child.path = newPath + child.path.substr(oldPath.length);
        await child.save();
      });

    await files
      .find(oldPathQuery)
      .cursor()
      .eachAsync(async file => {
        file.path = newPath + file.path.substr(oldPath.length);
        await file.save();
      });

    next();
  } catch (error) {
    next(error);
  }
});

FolderSchema.virtual("deepness").get(function(this: Folder) {
  return this.path.split("/").filter(el => el.length > 0).length;
});

FolderSchema.methods.toDto = function(this: Folder): FolderDto {
  return plainToClass(FolderDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
