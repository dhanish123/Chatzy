export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(422).json({ message: 'No file uploaded' });
    }

    // Convert file to base64
    const base64Data = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    res.json({
      url: dataUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

export const uploadImage = async (req, res, next) => uploadFile(req, res, next);
export const uploadVideo = async (req, res, next) => uploadFile(req, res, next);
export const uploadAudio = async (req, res, next) => uploadFile(req, res, next);
export const uploadFileGeneric = async (req, res, next) => uploadFile(req, res, next);
