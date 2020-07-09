import { User } from "~/interfaces/user.interface";

export interface LoginDto {
  password: string;
  recaptcha: string;
  username: User["username"];
}
