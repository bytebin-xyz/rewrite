import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { IRequest } from "@/interfaces/request.interface";

export const CurrentUser = createParamDecorator((field: string, ctx: ExecutionContext) => {
  const user = ctx.switchToHttp().getRequest<IRequest>().user;
  return field ? user && user[field] : user;
});
