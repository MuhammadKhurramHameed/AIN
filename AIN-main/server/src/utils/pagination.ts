import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Parses `page`/`limit` query params with sane defaults and a hard cap, so no endpoint
 * can be made to dump an unbounded collection by omitting them or passing a huge value. */
export function parsePagination(req: Request, opts: { defaultLimit?: number; maxLimit?: number } = {}): PaginationParams {
  const defaultLimit = opts.defaultLimit ?? 50;
  const maxLimit = opts.maxLimit ?? 200;

  const rawPage = Number(req.query.page);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

  const rawLimit = Number(req.query.limit);
  const limit = Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(Math.floor(rawLimit), maxLimit) : defaultLimit;

  return { page, limit, skip: (page - 1) * limit };
}

export function paginationMeta(total: number, { page, limit }: PaginationParams): PaginationMeta {
  return { total, page, pageSize: limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
