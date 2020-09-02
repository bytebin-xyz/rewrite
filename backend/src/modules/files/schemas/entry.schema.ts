import { Document, FilterQuery, QueryCursor } from "mongoose";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { plainToClass } from "class-transformer";

import { EntryDto } from "../dto/entry.dto";

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
export class Entry extends Document implements EntryDto {
  createdAt!: Date;

  @Prop({
    default: true
  })
  deletable!: boolean;

  depth!: number;

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
    required: true
  })
  isDirectory!: boolean;

  @Prop({
    required: true
  })
  isFile!: boolean;

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
    min: 0,
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

  getChildren!: (query?: FilterQuery<Entry>) => QueryCursor<Entry>;
  getParent!: () => Promise<Entry | null>;
  toDto!: () => EntryDto;
}

export const EntrySchema = SchemaFactory.createForClass(Entry);

EntrySchema.pre<Entry>("remove", function(next) {
  this.model<Entry>(Entry.name)
    .deleteMany({
      path: { $regex: `^${this.path}/` },
      uid: this.uid
    })
    .then(() => next())
    .catch(error => next(error));
});

EntrySchema.pre<Entry>("save", async function(next) {
  if (!this.isNew) return next();
  if (!this.id && this.isFile) return next(new Error("File ID is missing upon entry creation!"));

  try {
    if (!this.id && this.isDirectory) {
      this.id = await generateId(8);
    }

    const parent = await this.getParent();

    this.path = parent ? `${parent.path}/${this.name}` : `/${this.name}`;
    this.size = this.isDirectory ? 0 : this.size;

    next();
  } catch (error) {
    next(error);
  }
});

EntrySchema.pre<Entry>("save", async function(next) {
  if (this.isNew || (!this.isModified("name") && !this.isModified("parent"))) return next();

  try {
    const parent = await this.getParent();

    const newPath = parent ? `${parent.path}/${this.name}` : `/${this.name}`;
    const oldPath = this.path.toString();

    this.path = newPath;

    await this.model<Entry>(Entry.name)
      .find({
        path: { $regex: `^${oldPath}/` },
        uid: this.uid
      })
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

EntrySchema.pre<Entry>("save", async function(next) {
  if (
    !this.isModified("deletable") &&
    !this.isModified("hidden") &&
    !this.isModified("parent") &&
    !this.isModified("public")
  ) {
    return next();
  }

  try {
    const parent = await this.getParent();

    const deletable = parent ? parent.deletable : this.deletable;

    // If the parent is set to false for these, then the childrens for these can only be false
    const hidden = parent?.hidden === false ? false : this.hidden;
    const isPublic = parent?.public === false ? false : this.public;

    this.deletable = deletable;
    this.hidden = hidden;
    this.public = isPublic;

    await this.model<Entry>(Entry.name).updateMany(
      {
        path: { $regex: `^${this.path}/` },
        uid: this.uid
      },
      {
        deletable,
        hidden,
        public: isPublic
      }
    );

    next();
  } catch (error) {
    next(error);
  }
});

EntrySchema.virtual("depth").get(function(this: Entry) {
  return this.path.split("/").filter(el => el.length > 0).length;
});

EntrySchema.methods.getChildren = function(
  this: Entry,
  query: FilterQuery<Entry> = {}
): QueryCursor<Entry> {
  return this.model<Entry>(Entry.name)
    .find({
      ...query,
      path: { $regex: `^${this.path}/` },
      uid: this.uid
    })
    .cursor();
};

EntrySchema.methods.getParent = async function(this: Entry): Promise<Entry | null> {
  if (!this.parent) return null;

  return this.model<Entry>(Entry.name).findOne({
    id: this.parent,
    uid: this.uid
  });
};

EntrySchema.methods.toDto = function(this: Entry): EntryDto {
  return plainToClass(EntryDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
