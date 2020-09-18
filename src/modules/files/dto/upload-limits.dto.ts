import { ApiProperty } from "@nestjs/swagger";

export class UploadLimitsDto {
  @ApiProperty({
    description: "The maximum file size you can upload.",
    example: 1,
    minimum: 1
  })
  maxFileSize!: number;

  @ApiProperty({
    description: "The maximum amount of files you can upload per request.",
    example: 1,
    minimum: 1
  })
  maxFilesPerUpload!: number;
}
