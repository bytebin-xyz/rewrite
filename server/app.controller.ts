import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("hello")
  async hello() {
    return "Hello World!";
  }
}
