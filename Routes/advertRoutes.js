const express = require('express');
const {getAllAdverts, getAdvertById, createAdvert, updateAdvert, deleteAdvert, getVendorAdverts} = require('../Controllers/advertController');
const {auth, vendorAuth} = require('../Middlewares/authMiddleware');
const {validateAdvert} = require('../Middlewares/validation');
const upload = require('../Middlewares/upload');

const router = express.Router();

// endpoint for getting all the ads - anyone can view ads (no authentication needed)
router.get('/', getAllAdverts);

// // endpoint for vendors to get their own ads only
// auth checks if logged in, vendorAuth checks if vendor, then get their ads
router.get('/my-ads', auth, vendorAuth, getVendorAdverts);



// endpoint to get a single ad by its ID - anyone can view a specific ad
router.get('/:id', getAdvertById);


router.post('/', auth, vendorAuth, upload.single('image'), validateAdvert, createAdvert);


// endpoint for vendors only as they are the only ones with permission to post
// middleware runs in order: auth (check if logged in) → vendorAuth (check if vendor) → upload (handle image) → validateAdvert (check data) → createAdvert (actually create)
router.post('/', auth, vendorAuth, upload.single('image'), validateAdvert, createAdvert);

// endpoint for vendors only to edit their ads
// auth checks if logged in, vendorAuth checks if vendor, upload handles new image (optional), then update the ad
router.put('/:id', auth, vendorAuth, upload.single('image'), updateAdvert);

// endpoint for vendors to be able to delete their own ads
// only needs auth checks since deletion doesn't involve file upload or data validation
router.delete('/:id', auth, vendorAuth, deleteAdvert);

module.exports = router;
