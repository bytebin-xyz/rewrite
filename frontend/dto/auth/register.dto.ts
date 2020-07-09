import { User } from "~/interfaces/user.interface";

export interface RegisterDto {
  email: User["email"];
  password: string;
  recaptcha: string;
  username: User["username"];
}
