import bcrypt from "bcrypt";
import ms from "ms";

import { isAlphanumeric, isEmail } from "class-validator";

import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";

import { generateId } from "@/utils/generateId";
import { hideSchemaProperty } from "@/utils/hideSchemaProperty";

@Schema({
  timestamps: true,
  toJSON: {
    transform: hideSchemaProperty(["_id", "__v", "password"])
  },
  toObject: {
    transform: hideSchemaProperty(["_id", "__v", "password"])
  }
})
export class User extends Document {
  createdAt!: Date;
  updatedAt!: Date;

  @Prop({
    default: false
  })
  activated!: boolean;

  @Prop(
    raw({
      default: null,
      index: {
        partialFilterExpression: {
          avatar: {
            $type: "string"
          }
        }
      },
      lowercase: true,
      maxlength: 16,
      minlength: 16,
      trim: true,
      type: String,
      unique: true
    })
  )
  avatar!: string | null;

  @Prop({
    default: false
  })
  deleted!: boolean;

  @Prop({
    maxlength: 32,
    required: true,
    trim: true,
    validate: isAlphanumeric
  })
  displayName!: string;

  @Prop({
    lowercase: true,
    required: true,
    trim: true,
    unique: true,
    validate: isEmail
  })
  email!: string;

  @Prop({
    default: () => new Date(Date.now() + ms("7d")),
    expires: 0
  })
  expiresAt!: Date;

  /*
   ** Automatically hashed in pre save hook.
   ** Hidden from return object with hideSchemaProperty()
   */
  @Prop({
    required: true
  })
  password!: string;

  // Automatically generated in pre save hook.
  @Prop({
    lowercase: true,
    maxlength: 16,
    minlength: 16,
    trim: true,
    unique: true
  })
  uid!: string;

  @Prop({
    lowercase: true,
    maxlength: 32,
    required: true,
    trim: true,
    unique: true,
    validate: isAlphanumeric
  })
  username!: string;

  activate!: () => Promise<this>;
  changeAvatar!: (filename: string) => Promise<this>;
  changeDisplayName!: (newDisplayName: string) => Promise<this>;
  changeEmail!: (newEmail: string) => Promise<this>;
  changePassword!: (newPassword: string) => Promise<this>;
  comparePassword!: (password: string) => Promise<boolean>;
  delete!: () => Promise<this>;
  deleteAvatar!: () => Promise<this>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>("save", function(next) {
  if (!this.isNew) return next();

  generateId(8)
    .then(uid => {
      this.uid = uid;
      next();
    })
    .catch(next);
});

UserSchema.pre<User>("save", function(next) {
  if (!this.isModified("password") || this.password == null) return next();

  bcrypt.hash(this.password, 10, (error, hashed) => {
    if (error) return next(error);

    this.password = hashed;
    next();
  });
});

UserSchema.methods.activate = async function(this: any) {
  if (!this.activated || this.expiresAt) {
    this.activated = true;
    this.expiresAt = null;

    await this.save();
  }

  return this;
};

UserSchema.methods.changeAvatar = async function(this: User, filename: string) {
  if (this.avatar !== filename) {
    this.avatar = filename;
    await this.save();
  }

  return this;
};

UserSchema.methods.changeDisplayName = async function(this: User, newDisplayName: string) {
  if (this.displayName !== newDisplayName) {
    this.displayName = newDisplayName;
    await this.save();
  }

  return this;
};

UserSchema.methods.changeEmail = async function(this: User, newEmail: string) {
  if (this.email !== newEmail) {
    this.email = newEmail;
    await this.save();
  }

  return this;
};

UserSchema.methods.changePassword = async function(this: User, newPassword: string) {
  this.password = newPassword;
  return this.save();
};

UserSchema.methods.comparePassword = function(this: User, password: string) {
  return bcrypt.compare(password, this.password);
};

/*
 ** Don't actually delete the user document to prevent recycling display names + usernames
 ** Overwrite type safety of *this* to set email and password to null
 */
UserSchema.methods.delete = async function(this: any) {
  if (!this.deleted) {
    this.activated = false;
    this.avatar = null;
    this.deleted = true;
    this.email = null;
    this.password = null;

    await this.save({ validateBeforeSave: false });
  }

  return this;
};

UserSchema.methods.deleteAvatar = async function(this: User) {
  if (this.avatar) {
    this.avatar = null;
    await this.save();
  }

  return this;
};
