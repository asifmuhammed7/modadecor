const multer = require('multer');

const productImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/admin/assets/productsImages');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const profileImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/admin/assets/profileImages');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const bannerImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/admin/assets/bannerImages');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const bannerImageUpload = multer({ storage: bannerImageStorage }).array('bannerImage', 4);
const productImageUpload = multer({ storage: productImageStorage }).array('images', 4);
const profileImageUpload = multer({ storage: profileImageStorage }).single('profileImage');

module.exports = {
  productImageUpload,
  profileImageUpload,
  bannerImageUpload
};
