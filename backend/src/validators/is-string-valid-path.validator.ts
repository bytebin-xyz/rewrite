import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions
} from "class-validator";

export const PATH_VALID_REGEX = /[^\0]+/g;

@ValidatorConstraint({ async: false, name: "isStringValidPath" })
export class IsStringValidPathConstraint implements ValidatorConstraintInterface {
  defaultMessage(): string {
    return "Value ($value) is not a valid path!";
  }

  validate(value: string): boolean {
    return !PATH_VALID_REGEX.test(value);
  }
}

export const IsStringValidPath = (validationOptions?: ValidationOptions) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStringValidPathConstraint
    });
  };
};
