import { Types } from "mongoose";

export interface CursorPaginationParams {
  cursor?: string;  // _id of last item from previous page
  limit?: number;   // items per page (default 20, max 100)
  // Legacy fallback
  page?: number;
  sortField?: string;
  sortOrder?: 1 | -1;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function parsePaginationParams(query: any): CursorPaginationParams {
  return {
    cursor: query.cursor || undefined,
    limit: Math.min(Math.max(parseInt(query.limit) || 20, 1), 100),
    page: query.page ? parseInt(query.page) : undefined,
  };
}

export function buildCursorFilter(
  baseFilter: any,
  cursor?: string,
  sortOrder: 1 | -1 = -1,
): any {
  if (!cursor) return baseFilter;

  try {
    const cursorId = new Types.ObjectId(cursor);
    return {
      ...baseFilter,
      _id: sortOrder === -1 ? { $lt: cursorId } : { $gt: cursorId },
    };
  } catch {
    return baseFilter; // invalid cursor, ignore
  }
}

export function buildCursorResult<T extends { _id: any }>(
  items: T[],
  limit: number,
): CursorPaginatedResult<T> {
  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore && sliced.length > 0
    ? sliced[sliced.length - 1]._id.toString()
    : null;

  return { items: sliced, nextCursor, hasMore };
}
