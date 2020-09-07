import { ApiProperty } from "@nestjs/swagger";

export class PartialUserDto {
  admin!: boolean;

  @ApiProperty({ nullable: true, type: String })
  avatar!: string | null;

  createdAt!: Date;

  displayName!: string;

  id!: string;

  username!: string;
}
