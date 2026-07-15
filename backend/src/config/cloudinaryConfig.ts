import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // ponytail: simplify public_id to avoid special character issues in Cloudinary
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return {
      folder: 'toybox',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      public_id: `${timestamp}-${cleanName.substring(0, 50)}`,
    };
  },
});

const upload = multer({ storage: storage });

export { cloudinary, upload };
