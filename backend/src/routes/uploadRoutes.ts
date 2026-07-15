import express, { Request, Response } from 'express';
import { upload } from '../config/cloudinaryConfig';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  res.send({
    message: 'Image uploaded to Cloudinary',
    url: req.file.path, // req.file.path contains the Cloudinary URL
  });
});

export default router;
