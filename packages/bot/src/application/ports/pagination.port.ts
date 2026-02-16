export interface PaginationConfig<T> {
  items: T[];
  pageSize: number;
  currentPage: number;
  renderItem: (item: T, index: number) => string;
  renderEmpty?: () => string;
}

export interface PaginationResult {
  message: string;
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
}

export interface IPaginationComponent {
  paginate<T>(config: PaginationConfig<T>): PaginationResult;
}
