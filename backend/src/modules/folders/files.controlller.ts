import { Controller, Get, Param, Post } from "@nestjs/common";

@Controller("files")
export class FilesController {
  @Get("/download/:id")
  download(@Param("id") id: string) {}

  @Post("/upload")
  upload() {}
}
