import crypto from "crypto";

import { isAlphanumeric } from "class-validator";

import { plainToClass } from "class-transformer";

import { Document, Types } from "mongoose";

import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";

import { ApplicationDto } from "../dto/application.dto";

import { ApplicationScopes } from "@/modules/applications/enums/application-scopes.enum";

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
    enum: Object.values(ApplicationScopes),
    type: [String]
  })
  scopes!: Types.Array<ApplicationScopes>;

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
  hasSufficientScopes!: (scopes: ApplicationScopes[]) => boolean;
  toDto!: () => ApplicationDto;
  updateLastUsed!: () => Promise<this>;
  updateScopes!: (scopes: ApplicationScopes[]) => Promise<this>;
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

ApplicationSchema.methods.hasSufficientScopes = function(
  this: Application,
  scopes: ApplicationScopes[]
) {
  return scopes.every(scope => this.scopes.includes(scope));
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

ApplicationSchema.methods.updateScopes = async function(
  this: Application,
  scopes: ApplicationScopes[]
) {
  this.scopes = new Types.Array();

  for (const scope of scopes) {
    this.scopes.addToSet(scope);
  }

  await this.save();

  return this;
};
