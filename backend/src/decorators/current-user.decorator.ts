import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { IRequest } from "@/interfaces/request.interface";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<IRequest>().user
);
