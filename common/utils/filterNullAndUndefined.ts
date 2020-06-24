// Filter out undefined + null from an array in a typesafe manner
// https://codereview.stackexchange.com/questions/135363/filtering-undefined-elements-out-of-an-array

export const filterNullAndUndefined = <T>(array: (T | undefined | null)[]): T[] =>
  array.filter((element: T | undefined | null): element is T => element != null);
