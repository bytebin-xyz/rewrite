import { Injectable } from "@nestjs/common";

import { UsersService } from "@/modules/users/users.service";

@Injectable()
export class AdminService {
  constructor(private readonly users: UsersService) {}
}
