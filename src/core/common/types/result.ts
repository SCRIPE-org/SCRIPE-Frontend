export type Result<T, E = Error> = { kind: "ok"; value: T } | { kind: "err"; error: E };

export const Result = {
  ok: <T, E = Error>(value: T): Result<T, E> => ({ kind: "ok", value }),
  err: <T, E = Error>(error: E): Result<T, E> => ({ kind: "err", error }),
};
