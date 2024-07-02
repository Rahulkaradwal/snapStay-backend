const Cabin = require('../models/cabinModel');
const handler = require('../utils/Handler');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const CatchAsync = require('../utils/CatchAsync');

// get all cabins
exports.getAllCabins = handler.getAll(Cabin);

// get a cabin
exports.getCabin = handler.getOne(Cabin);

// create cabin
exports.addCabin = handler.addOne(Cabin);

// Update Cabin
exports.updateCabin = handler.updateOne(Cabin);

// Delete Cabin
exports.deleteCabin = handler.deleteOne(Cabin);

const multerStorage = multer.memoryStorage();

// config S3 Client

const s3Client = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadCabinPhoto = upload.single('image');

exports.uploadPhotoToS3 = CatchAsync(async (req, res, next) => {
  console.log('in upload to photo to s3', req.body.file);
  if (!req.file) return next();

  const filename = `${req.body.name}-${Date.now()}-${req.file.originalname}`;
  // console.log('aws upload', filename);

  try {
    const uploadParams = {
      Bucket: 'snap-stay',
      Key: `cabin-photos/${filename}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    const data = await upload.done();

    req.file.filename = filename;
    req.file.location = data.Location;
    // req.body = req.file.location;

    next();
  } catch (err) {
    console.error('Error uploading image:', err);
    return next(new AppError('Error uploading image', 500));
  }
});
