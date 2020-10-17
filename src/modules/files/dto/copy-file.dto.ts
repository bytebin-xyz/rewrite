import { IsOptional, IsString } from "class-validator";

export class CopyFileDto {
  @IsOptional()
  @IsString()
  to!: string | null;
}
