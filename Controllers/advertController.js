const Advert = require("../Models/adverts");
const cloudinary = require("../Config/cloudinaryConfiq");

// users getting adverts by searching or filtering
const getAllAdverts = async (req, res) => {
  // this handles getting all the adverts
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    // this gets the search options from the url
    // the below will store the filter objects
    let filter = {};
    if (search) {
      //the user must search using title or description
      filter.$or = [
        { title: { $regex: search, $options: "i" } }, 
        { description: { $regex: search, $options: "i" } }, 
      ];
    }
    if (category) {
      filter.category = category;
      // only adverts under the categories the users filter will be shown
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      // conditions
      if (minPrice) filter.price.$gte = Number(minPrice);
      // $gte = greater than or equal (minimum price),$lte = less than or equal (maximum price),Number() converts string to number
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    // this gets the adverts after users have searched and filtered
    const adverts = await Advert.find(filter)
      .populate("vendor", "name email")
      // this shows vendor's details
      .sort({ createdAt: -1 });
    //  show the most recently posted adverts at the top (-1 means newest to oldest)
    res.json({ adverts });
    //   gets the adverts array directly
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message, 
    });
  }
};

// get specific adverts
const getAdvertById = async (req, res) => {
  try {
    const advert = await Advert.findById(req.params.id).populate(
      "vendor",
      "name email"
    );
    // this finds the adverts and adds the vendor's details to it as well
    if (!advert) {
      return res.status(404).json({
        message: "Advert not found",
      });
    }
    res.json(advert);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message, 
    });
  }
};

// authorization for only vendors to create adverts
const createAdvert = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    let imageUrl = "";
    // handling image uploads
    if (req.file) {
      const results = await cloudinary.uploader.upload(req.file.path, {
        folder: "adverts",
      });
      imageUrl = results.secure_url;
    }
    const advert = new Advert({
      title,
      description,
      price: Number(price),
      category,
      image: imageUrl,
      vendor: req.user.userId,
    });
    await advert.save();
    await advert.populate("vendor", "name email");
    res.status(201).json({
      message: "Advert created successfully", 
      advert,
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete uploaded file:", err);
      });
    }
    res.status(500).json({
      message: "Internal server error",
      error: error.message, 
    });
  }
};

// Authorization for only vendors to edit adverts
const updateAdvert = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const advert = await Advert.findById(req.params.id);
    
    if (!advert) {
      return res.status(404).json({
        message: "Advert not found",
      });
    }
    
    // make sure only the vendor who created this ad can edit it
    if (advert.vendor.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }
 
    // keep the old image by default
    let imageUrl = advert.image;
    
    // if a new image is uploaded, handle the swap
    if (req.file) {
      // delete the old image from cloudinary first to avoid clutter
      if (advert.image) {
        try {
          // extract the public_id from the cloudinary url so it is deleted
          const oldPublicId = advert.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`adverts/${oldPublicId}`);
        } catch (deleteError) {
          console.error("Failed to delete old image from Cloudinary:", deleteError);
          // don't stop the whole process if deletion fails, just log it
        }
      }
      // now upload the new image
      const results = await cloudinary.uploader.upload(req.file.path, {
        folder: "adverts",
      });
      imageUrl = results.secure_url;
    }
 
    // update the advert with new info or keep old values if nothing new is provided
    const updatedAdvert = await Advert.findByIdAndUpdate(
      req.params.id,
      {
        title: title || advert.title,
        description: description || advert.description,
        price: price ? Number(price) : advert.price,
        category: category || advert.category,
        image: imageUrl,
      },
      { new: true } 
      // return the updated version, not the old one
    ).populate("vendor", "name email");
 
    res.json({
      message: "Advert updated successfully",
      advert: updatedAdvert,
    });
  } catch (error) {
    // clean up the uploaded file if something went wrong
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete uploaded file:", err);
      });
    }
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
 };




// For vendors to delete
const deleteAdvert = async (req, res) => {
  try {
    const advert = await Advert.findById(req.params.id);
    if (!advert) {
      return res.status(404).json({
        message: "Advert not found",
      });
    }
    if (advert.vendor.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }
    await Advert.findByIdAndDelete(req.params.id);
    res.json({
      message: "Advert deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAdverts,
  getAdvertById,
  createAdvert,
  updateAdvert,
  deleteAdvert,
};
