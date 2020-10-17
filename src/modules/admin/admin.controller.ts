import { Controller, UseGuards } from "@nestjs/common";

import { AdminService } from "./admin.service";

import { AdminGuard } from "@/guards/admin.guard";

import { UsersService } from "@/modules/users/users.service";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly users: UsersService
  ) {}
}
