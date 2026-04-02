/*
  Wraps an async function so that any rejected promise
  is automatically forwarded to Express error handling,
  instead of needing try/catch in every controller.
*/
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
