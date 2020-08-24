import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions
} from "class-validator";

export const PATH_SAFE_REGEX = /[\\/:*?\"<>|]/g;

@ValidatorConstraint({ async: false, name: "isStringPathSafe" })
export class IsStringPathSafeConstraint implements ValidatorConstraintInterface {
  defaultMessage(): string {
    return `Value ($value) cannot contain / : * ? \\ " < > |`;
  }

  validate(value: string): boolean {
    return !PATH_SAFE_REGEX.test(value);
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
