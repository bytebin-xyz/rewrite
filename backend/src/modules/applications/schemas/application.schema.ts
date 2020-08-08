import crypto from "crypto";

import { plainToClass } from "class-transformer";

import { isAlphanumeric } from "class-validator";

import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";

import { ApplicationDto } from "../dto/application.dto";

import { btoa } from "@/utils/btoa";
import { generateId } from "@/utils/generateId";

const HMAC_SHA256 = (data: crypto.BinaryLike, secret: string) =>
  crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");

@Schema({
  id: false,
  timestamps: true
})
export class Application extends Document implements ApplicationDto {
  createdAt!: Date;
  updatedAt!: Date;

  // Automatically generated in pre save hook.
  @Prop({
    lowercase: true,
    maxlength: 18,
    minlength: 18,
    trim: true,
    unique: true
  })
  id!: string;

  @Prop(
    raw({
      default: null,
      index: {
        partialFilterExpression: {
          key: {
            $type: "string"
          }
        }
      },
      trim: true,
      type: String,
      unique: true
    })
  )
  key!: string | null;

  @Prop(
    raw({
      default: null,
      type: Date
    })
  )
  lastUsed!: Date | null;

  @Prop({
    maxlength: 32,
    required: true,
    trim: true,
    unique: true,
    validate: isAlphanumeric
  })
  name!: string;

  @Prop({
    lowercase: true,
    maxlength: 16,
    minlength: 16,
    required: true,
    trim: true
  })
  uid!: string;

  changeName!: (newName: string) => Promise<this>;
  compareKey!: (key: string, secret: string) => boolean;
  generateKey!: (secret: string) => Promise<string>;
  toDto!: () => ApplicationDto;
  updateLastUsed!: () => Promise<this>;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.pre<Application>("save", function(next) {
  if (!this.isNew) return next();

  generateId(9)
    .then(id => {
      this.id = id;
      next();
    })
    .catch(error => next(error));
});

ApplicationSchema.methods.changeName = async function(
  this: Application,
  newName: string
): Promise<Application> {
  if (this.name !== newName) {
    this.name = newName;
    await this.save();
  }

  return this;
};

ApplicationSchema.methods.compareKey = function(
  this: Application,
  key: string,
  secret: string
): boolean {
  if (!this.key) return false;

  return crypto.timingSafeEqual(Buffer.from(HMAC_SHA256(key, secret)), Buffer.from(this.key));
};

ApplicationSchema.methods.generateKey = async function(
  this: Application,
  secret: string
): Promise<string> {
  const token = await generateId(16);
  const key = `${this.id}.${token}`;

  this.key = HMAC_SHA256(key, secret);

  await this.save();

  return btoa(key);
};

ApplicationSchema.methods.toDto = function(this: Application): ApplicationDto {
  return plainToClass(ApplicationDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};

ApplicationSchema.methods.updateLastUsed = async function(this: Application): Promise<Application> {
  this.lastUsed = new Date();

  await this.save();

  return this;
};
