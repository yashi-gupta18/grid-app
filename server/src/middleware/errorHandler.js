export const notFound = (req, res) => {
  res.status(404).json({ error: "Route not found." });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? "Unexpected server error." : err.message;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
};
