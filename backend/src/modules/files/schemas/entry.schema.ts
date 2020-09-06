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
    trim: true,
    unique: true
  })
  id!: string;

  @Prop({
    required: true
  })
  isFile!: boolean;

  @Prop({
    required: true
  })
  isFolder!: boolean;

  @Prop({
    maxlength: 255,
    required: true,
    trim: true,
    validate: (value: string) => !PATH_SAFE_REGEX.test(value)
  })
  name!: string;

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

  /**
   * Will be used for sorting when entries are paginated.
   * It is derived from the updatedAt property in a pre save hook.
   */
  @Prop()
  timestamp!: number;

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
  getParentFolder!: () => Promise<Entry | null>;
  toDto!: () => EntryDto;
}

export const EntrySchema = SchemaFactory.createForClass(Entry);

export const ENTRY_COLLATION_OPTIONS = { locale: "en", strength: 2 };

EntrySchema.index({ name: 1 }, { collation: ENTRY_COLLATION_OPTIONS });

EntrySchema.pre<Entry>("remove", function (next) {
  this.model<Entry>(Entry.name)
    .deleteMany({
      path: { $regex: `^${this.path}/` },
      uid: this.uid
    })
    .then(() => next())
    .catch((error) => next(error));
});

EntrySchema.pre<Entry>("save", async function (next) {
  if (!this.isNew) return next();
  if (!this.id && this.isFile) return next(new Error("File ID is missing upon entry creation!"));

  try {
    if (!this.id && this.isFolder) {
      this.id = await generateId(8);
    }

    this.size = this.isFolder ? 0 : this.size;

    next();
  } catch (error) {
    next(error);
  }
});

EntrySchema.pre<Entry>("save", function (next) {
  if (!this.isModified()) return next();

  this.timestamp = this.updatedAt.getTime();

  next();
});

EntrySchema.pre<Entry>("save", async function (next) {
  if (!this.isModified("folder") && !this.isModified("name")) return next();

  try {
    const folder = await this.getParentFolder();
    const newPath = folder ? `${folder.path}/${this.name}` : `/${this.name}`;

    if (!this.isNew) {
      // this.path is only available if it isn't a new document
      await this.model<Entry>(Entry.name)
        .find({
          path: { $regex: `^${this.path}/` },
          uid: this.uid
        })
        .cursor()
        .eachAsync(async (child) => {
          child.path = newPath + child.path.substr(this.path.length);
          await child.save();
        });
    }

    this.path = newPath;

    next();
  } catch (error) {
    next(error);
  }
});

EntrySchema.pre<Entry>("save", async function (next) {
  if (
    !this.isModified("deletable") &&
    !this.isModified("folder") &&
    !this.isModified("hidden") &&
    !this.isModified("public")
  ) {
    return next();
  }

  try {
    const parentFolder = await this.getParentFolder();

    const deletable = parentFolder ? parentFolder.deletable : this.deletable;

    // If the values of these fields are set to false on the parent folder,
    // then the values of its children can only be false.
    const hidden = parentFolder?.hidden === false ? false : this.hidden;
    const isPublic = parentFolder?.public === false ? false : this.public;

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

EntrySchema.virtual("depth").get(function (this: Entry) {
  return this.path.split("/").filter((el) => el.length > 0).length;
});

EntrySchema.methods.getChildren = function (
  this: Entry,
  query: FilterQuery<Entry> = {}
): QueryCursor<Entry> {
  return this.model<Entry>(Entry.name)
    .find({
      ...query,
      path: { $regex: `^${this.path}/` },
      uid: this.uid
    })
    .collation(ENTRY_COLLATION_OPTIONS)
    .cursor();
};

EntrySchema.methods.getParentFolder = async function (this: Entry): Promise<Entry | null> {
  if (!this.folder) return null;

  const folder = await this.model<Entry>(Entry.name).findOne({
    id: this.folder,
    uid: this.uid
  });

  // Document is a children of a deleted folder
  if (!folder && this.folder) {
    this.folder = null;
    await this.save();
  }

  return folder;
};

EntrySchema.methods.toDto = function (this: Entry): EntryDto {
  return plainToClass(EntryDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
