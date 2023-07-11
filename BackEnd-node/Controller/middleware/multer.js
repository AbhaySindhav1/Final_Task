const multer = require("multer");
const maxSize = 6 * 1000 * 1000; // 2MB

///                                                 /////        Vehicle  multer      ////                                           ///////

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/Vehicles");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  limits: { fileSize: maxSize },
}).single("profile");


const handleUpload = (req, res, next) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ error: err.message + " and greater than 2MB" });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({ error: err.message });
    } else {
      // File was uploaded successfully
      next();
    }
  });
};

///                                                 /////        Users  multer      ////                                           ///////

const UserStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/Users");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const Userupload = multer({
  storage: UserStorage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  limits: { fileSize: maxSize },
}).single("profile");

const handleUserUpload = (req, res, next) => {
  Userupload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ sizeError: err.message + " and greater than 2MB" });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({ fileError: err.message });
    } else {
      // File was uploaded successfully
      next();
    }
  });
};

///                                                 /////        Drivers  multer      ////                                           ///////

const DriverStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/Drivers");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const Driverupload = multer({
  storage: DriverStorage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  limits: { fileSize: maxSize },
}).single("profile");

const handleDriversUpload = (req, res, next) => {
  Driverupload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ sizeError: err.message + " and greater than 2MB" });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({ fileError: err.message });
    } else {
      // File was uploaded successfully
      next();
    }
  });
};

module.exports = { handleUpload, handleUserUpload, handleDriversUpload };
