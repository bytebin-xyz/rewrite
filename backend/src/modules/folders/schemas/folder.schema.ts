import { Document, Types } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { plainToClass } from "class-transformer";

import { FolderDto } from "../dto/folder.dto";

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
  updatedAt!: Date;

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

  @Prop({
    ref: Folder.name,
    type: Types.ObjectId
  })
  parent!: Folder | Types.ObjectId | null;

  @Prop({
    default: "/",
    index: true,
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

  populateParent!: () => Promise<Folder | null>;
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

FolderSchema.pre<Folder>("save", async function(next) {
  if (!this.isModified("name") && !this.isModified("parent")) return next();

  try {
    const parent = await this.populateParent();

    const newPath = parent ? `${parent.path}/${this.name}` : `/${this.name}`;
    const oldPath = this.path.toString();

    this.path = newPath;

    await this.model<Folder>(Folder.name)
      .find({ path: { $regex: `^${oldPath}/` } })
      .cursor()
      .eachAsync(async child => {
        child.path = newPath + child.path.substr(oldPath.length);
        await child.save();
      });

    next();
  } catch (error) {
    next(error);
  }
});

FolderSchema.post<Folder>("save", function(doc, next) {
  doc
    .populateParent()
    .then(() => next())
    .catch(error => next(error));
});

FolderSchema.virtual("deepness").get(function(this: Folder) {
  return this.path.split("/").filter(el => el.length > 0).length;
});

FolderSchema.methods.populateParent = async function(this: Folder): Promise<Folder | null> {
  await this.populate("parent").execPopulate();

  return this.parent as Folder | null;
};

FolderSchema.methods.toDto = function(this: Folder): FolderDto {
  return plainToClass(FolderDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
