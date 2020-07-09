// https://stackoverflow.com/a/55032655/10906378
export type Modify<T, R> = Omit<T, keyof R> & R;
