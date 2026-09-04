export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(422).json({ message: 'Validation error', errors: err.errors });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  if (err.message === 'Invalid file type') {
    return res.status(422).json({ message: 'Invalid file type' });
  }

  res.status(500).json({ message: 'Server error' });
};
