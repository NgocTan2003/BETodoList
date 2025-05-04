import { Document, Model } from 'mongoose';

// Khai báo các tùy chọn cho pagination
export interface PaginateOptions {
  page?: number;
  limit?: number;
  offset?: number;
  sort?: any;
  populate?: any;
  lean?: boolean;
  leanWithId?: boolean;
  customLabels?: any;
  forceCountFn?: boolean;
  read?: any;
  projection?: any;
  [key: string]: any;
}

// Khai báo kết quả phân trang
export interface PaginateResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page?: number;
  offset?: number;
  prevPage?: number;
  nextPage?: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  meta?: any;
}

// Định nghĩa PaginateModel cho việc sử dụng paginate
export interface PaginateModel<T extends Document> extends Model<T> {
  paginate(query?: any, options?: PaginateOptions): Promise<PaginateResult<T>>;
}
