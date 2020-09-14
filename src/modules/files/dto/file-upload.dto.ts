import { ApiProperty } from "@nestjs/swagger";

export class FileUploadDto {
  @ApiProperty({ format: "binary", type: "string" })
  file: any;
}
