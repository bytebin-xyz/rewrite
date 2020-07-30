import ms from "ms";

import { Document, Types } from "mongoose";

import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";

import { plainToClass } from "class-transformer";

import { UploadSessionDto } from "../dto/upload-session.dto";

import { generateId } from "@/utils/generateId";
import { pathFromString } from "@/utils/pathFromString";

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
export class UploadSession extends Document implements UploadSessionDto {
  createdAt!: Date;
  updatedAt!: Date;

  // Virtuals
  finished!: boolean;
  lastChunkSize!: number;

  @Prop({
    default: 5 * 1024 * 1024,
    min: 1
  })
  chunkSize!: number;

  // Automatically calculated in pre save hook.
  @Prop({
    min: 1
  })
  chunksTotal!: number;

  @Prop({
    default: () => [],
    min: 0,
    type: [Number]
  })
  chunksUploaded!: Types.Array<number>;

  @Prop(
    raw({
      default: null,
      type: Date
    })
  )
  commitedAt!: Date | null;

  @Prop({
    default: () => new Date(Date.now() + ms("2d")),
    expires: 0
  })
  expiresAt!: Date;

  @Prop({
    maxlength: 255,
    required: true,
    trim: true
  })
  filename!: string;

  // Automatically generated in pre save hook.
  @Prop({
    lowercase: true,
    maxlength: 16,
    minlength: 16,
    trim: true,
    unique: true
  })
  id!: string;

  // Automatically determined in pre save hook.
  @Prop({
    trim: true
  })
  partialPath!: string;

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

  toDto!: () => UploadSessionDto;
  updateChunksUploaded!: () => Promise<this>;
}

export const UploadSessionSchema = SchemaFactory.createForClass(UploadSession);

UploadSessionSchema.pre<UploadSession>("save", function(next) {
  if (!this.isNew) return next();

  generateId(8)
    .then(id => {
      this.chunksTotal = Math.ceil(this.size / this.chunkSize);
      this.id = id;
      this.partialPath = pathFromString(id);

      next();
    })
    .catch(error => next(error));
});

UploadSessionSchema.virtual("finished").get(function(this: UploadSession): boolean {
  for (let i = 0; i < this.chunksTotal; i += 1) {
    if (!this.chunksUploaded.includes(i)) return false;
  }
  
  return true;
});

UploadSessionSchema.virtual("lastChunkSize").get(function(this: UploadSession): number {
  return this.size - Math.floor(this.size / this.chunkSize) * this.chunkSize;
});

UploadSessionSchema.methods.toDto = function(this: UploadSession): UploadSessionDto {
  return plainToClass(UploadSessionDto, this.toJSON(), {
    excludePrefixes: ["_"]
  });
};

UploadSessionSchema.methods.updateChunksUploaded = async function(
  this: UploadSession,
  chunkIndex: number
): Promise<UploadSession> {
  if (this.chunksUploaded.length < this.chunksTotal) {
    this.chunksUploaded.addToSet(chunkIndex);
    await this.save();
  }

  return this;
};
