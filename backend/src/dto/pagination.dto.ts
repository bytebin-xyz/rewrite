import { Pagination } from "@/utils/paginate";

export class PaginationDto<T> implements Pagination<T> {
  hasNext!: boolean;

  items!: T[];

  next!: string | null;
}
