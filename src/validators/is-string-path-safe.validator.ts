import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions
} from "class-validator";

export const UNSAFE_CHARACTERS = ["\\\\", "/", ":", "*", "?", '"', "<", ">", "|"];
export const UNSAFE_PATH_REGEX = new RegExp(`[${UNSAFE_CHARACTERS.join("")}]`, "g");

@ValidatorConstraint({ name: "isStringPathSafe" })
export class IsStringPathSafeConstraint implements ValidatorConstraintInterface {
  static validate(value: string): boolean {
    /**
     * Do NOT use UNSAFE_PATH_REGEX.test(), as it is a stateful object which can cause the validation to return different values
     * https://stackoverflow.com/questions/11477415/why-does-javascripts-regex-exec-not-always-return-the-same-value
     */
    return !value.match(UNSAFE_PATH_REGEX);
  }

  defaultMessage(): string {
    return `Value ($value) cannot contain any of these characters ${UNSAFE_CHARACTERS.join(" ")}`;
  }

  validate(value: string): boolean {
    return IsStringPathSafeConstraint.validate(value);
  }
}

export const IsStringPathSafe = (validationOptions?: ValidationOptions) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStringPathSafeConstraint
    });
  };
};
