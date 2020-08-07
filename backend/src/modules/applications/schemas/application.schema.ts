import { plainToClass } from "class-transformer";

import { isAlphanumeric } from "class-validator";

import { Document } from "mongoose";

import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";

import { ApplicationDto } from "../dto/application.dto";

import { generateId } from "@/utils/generateId";

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
    maxlength: 16,
    minlength: 16,
    trim: true,
    unique: true
  })
  id!: string;

  @Prop({
    maxlength: 32,
    required: true,
    trim: true,
    unique: true,
    validate: isAlphanumeric
  })
  name!: string;

  @Prop(
    raw({
      default: null,
      maxlength: 32,
      minlength: 32,
      trim: true,
      type: String,
      unique: true
    })
  )
  token!: string | null;

  @Prop({
    lowercase: true,
    maxlength: 16,
    minlength: 16,
    required: true,
    trim: true
  })
  uid!: string;

  changeName!: (newName: string) => Promise<this>;
  changeToken!: (newToken: string) => Promise<this>;
  toDto!: () => ApplicationDto;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.pre<Application>("save", function(next) {
  if (!this.isNew) return next();

  generateId(8)
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

ApplicationSchema.methods.changeToken = async function(
  this: Application,
  newToken: string
): Promise<Application> {
  if (this.token !== newToken) {
    this.token = newToken;
    await this.save();
  }

  return this;
};

ApplicationSchema.methods.toDto = function(this: Application): ApplicationDto {
  return plainToClass(ApplicationDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};
