import multer from 'multer';

// Use memory storage so we can stream the buffer to cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
