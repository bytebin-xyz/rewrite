import { ArrayUnique, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

import { ApplicationScopes } from "../enums/application-scopes.enum";

export class CreateApplicationDto {
  @IsNotEmpty({ message: "Application name cannot be empty!" })
  @IsString({ message: "Application name must be a $constraint1" })
  @MaxLength(32, { message: "Application name cannot be greater than $constraint1 characters!" })
  name!: string;

  @ArrayUnique({ message: "Application scope elements must be unique!" })
  @IsEnum(ApplicationScopes, { each: true, message: "Invalid application scopes provided!" })
  @IsOptional()
  scopes: ApplicationScopes[] = [];
}
