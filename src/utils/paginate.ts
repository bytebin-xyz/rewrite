import { CollationOptions, Document, FilterQuery, Model } from "mongoose";

export interface Pagination<T> {
  hasNext: boolean;
  items: T[];
  next: string | null;
}

export interface PaginationOptions<T extends Document> {
  collation?: CollationOptions;
  cursor?: string | number;
  direction?: -1 | 1;
  field?: keyof Omit<T, keyof Document>;
  limit: number;
  query: FilterQuery<T>;
  sort?: {
    [key: string]: number;
  };
}

export const paginate = async <T extends Document>(
  model: Model<T>,
  options: PaginationOptions<T>
): Promise<Pagination<T>> => {
  const direction = options.direction || -1;
  const field = options.field || "_id";
  const operator = direction === -1 ? "$lt" : "$gt";
  const query = options.cursor
    ? { [field]: { [operator]: options.cursor } }
    : {};

  const items = await model
    .find({ ...options.query, ...query })
    .collation(options.collation || {})
    .sort({ ...options.sort, [field]: direction })
    .limit(options.limit + 1); // add 1 so we can check if there are more items after this page

  const hasNext = items.length > options.limit;
  if (hasNext) items.pop(); // remove the extra item from options.limit + 1

  const next = hasNext ? String(items[items.length - 1][field]) : null;

  return {
    hasNext,
    items,
    next
  };
};
