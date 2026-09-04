export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(422).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${process.env.API_URL}/uploads/${req.file.filename}`;

    res.json({
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (req, res, next) => uploadFile(req, res, next);
export const uploadVideo = async (req, res, next) => uploadFile(req, res, next);
export const uploadAudio = async (req, res, next) => uploadFile(req, res, next);
export const uploadFileGeneric = async (req, res, next) => uploadFile(req, res, next);
