// https://stackoverflow.com/questions/55479658/how-to-create-a-type-excluding-instance-methods-from-a-class-in-typescript

type DataPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type DataPropertiesOnly<T> = {
  [P in DataPropertyNames<T>]: T[P] extends object ? DTO<T[P]> : T[P];
};

export type DTO<T> = DataPropertiesOnly<T>;
