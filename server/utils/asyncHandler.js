// server/utils/asyncHandler.js
//
// Express 4 doesn't automatically catch a rejected promise thrown inside an
// async route handler — an unhandled rejection would just hang the request
// or crash the process, instead of reaching server.js's global error
// handler. Wrapping every async handler in this forwards any thrown/rejected
// error to `next(err)`, so the existing error-handling middleware still
// works exactly as it did with the old synchronous SQLite handlers.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
