export interface MongoErrorLike {
  name?: string;
  code?: number;
  keyValue?: Record<string, unknown>;
}

export function asMongoError(error: unknown): MongoErrorLike {
  return typeof error === 'object' && error !== null ? error : {};
}
