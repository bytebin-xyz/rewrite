import { User } from "~/interfaces/user.interface";

export interface ForgotPasswordDto {
  email: User["email"];
}
