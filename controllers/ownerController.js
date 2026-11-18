
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Sablah = require("../models/Sablah");

function isValidText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidNumbers(capacity, price) {
  return (
    capacity !== "" &&
    price !== "" &&
    Number.isInteger(Number(capacity)) &&
    Number(capacity) >= 1 &&
    Number.isFinite(Number(price)) &&
    Number(price) >= 0
  );
}

function parseAmenities(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getUploadedImages(files) {
  if (!files || !files.length) return [];
  return files.map((file) => `/uploads/${file.filename}`);
}

function deleteImageFiles(imagePaths = []) {
  imagePaths.forEach((imagePath) => {
    if (!imagePath || !imagePath.startsWith("/uploads/")) return;

    const filename = path.basename(imagePath);
    const fullPath = path.join(__dirname, "..", "uploads", filename);

    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (error) => {
        if (error) console.error("Image deletion error:", error);
      });
    }
  });
}

// ADD NEW SABLAH
exports.addSablah = async (req, res) => {
  try {
    const {
      nameEn, nameAr, governorate, wilayat,
      capacity, price, address, locationLat, locationLng,
      descriptionEn, descriptionAr, amenities
    } = req.body;

    if (
      !isValidText(nameEn) ||
      !isValidText(nameAr) ||
      !isValidText(governorate) ||
      !isValidText(wilayat) ||
      !isValidText(address)
    ) {
      deleteImageFiles(getUploadedImages(req.files));
      return res.status(400).json({
        message: "Please complete all required fields."
      });
    }

    if (!isValidNumbers(capacity, price)) {
      deleteImageFiles(getUploadedImages(req.files));
      return res.status(400).json({
        message: "Please enter a valid capacity and price."
      });
    }

    const uploadedImages = getUploadedImages(req.files);

    const sablah = await Sablah.create({
      owner: req.user.id,
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      governorate: governorate.trim(),
      wilayat: wilayat.trim(),
      area: wilayat.trim(),
      capacity: Number(capacity),
      price: Number(price),
      address: address.trim(),
      locationLat: Number.isFinite(Number(locationLat)) ? Number(locationLat) : null,
      locationLng: Number.isFinite(Number(locationLng)) ? Number(locationLng) : null,
      descriptionEn: descriptionEn || "",
      descriptionAr: descriptionAr || "",
      amenities: parseAmenities(amenities),
      images: uploadedImages,
      image: uploadedImages[0] || ""
    });

    return res.status(201).json({
      message: "Sablah added successfully.",
      sablah
    });
  } catch (error) {
    console.error("Add Sablah Error:", error);
    deleteImageFiles(getUploadedImages(req.files));
    return res.status(500).json({
      message: "Failed to add sablah."
    });
  }
};

// GET OWNER'S SABLAHS
exports.getMySablahs = async (req, res) => {
  try {
    const sablahs = await Sablah.find({
      owner: req.user.id
    }).sort({ createdAt: -1 });

    return res.status(200).json(sablahs);
  } catch (error) {
    console.error("Get My Sablahs Error:", error);
    return res.status(500).json({
      message: "Failed to retrieve sablahs."
    });
  }
};

// UPDATE OWNER'S SABLAH
exports.updateSablah = async (req, res) => {
  const uploadedImages = getUploadedImages(req.files);

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      deleteImageFiles(uploadedImages);
      return res.status(400).json({
        message: "Invalid sablah ID."
      });
    }

    const {
      nameEn, nameAr, governorate, wilayat,
      capacity, price, address, locationLat, locationLng,
      descriptionEn, descriptionAr,
      amenities, existingImages
    } = req.body;

    if (
      !isValidText(nameEn) ||
      !isValidText(nameAr) ||
      !isValidText(governorate) ||
      !isValidText(wilayat) ||
      !isValidText(address)
    ) {
      deleteImageFiles(uploadedImages);
      return res.status(400).json({
        message: "Please complete all required fields."
      });
    }

    if (!isValidNumbers(capacity, price)) {
      deleteImageFiles(uploadedImages);
      return res.status(400).json({
        message: "Invalid capacity or price."
      });
    }

    const sablah = await Sablah.findOne({
      _id: id,
      owner: req.user.id
    });

    if (!sablah) {
      deleteImageFiles(uploadedImages);
      return res.status(404).json({
        message: "Sablah not found."
      });
    }

    const oldImages = sablah.images?.length
      ? [...sablah.images]
      : sablah.image
        ? [sablah.image]
        : [];

    let keptImages = oldImages;

    if (existingImages !== undefined) {
      try {
        keptImages = JSON.parse(existingImages);

        if (
          !Array.isArray(keptImages) ||
          !keptImages.every(
            (image) => typeof image === "string" && oldImages.includes(image)
          )
        ) {
          throw new Error("Invalid image list");
        }
      } catch {
        deleteImageFiles(uploadedImages);
        return res.status(400).json({
          message: "Invalid existing images."
        });
      }
    }

    const allImages = [...keptImages, ...uploadedImages];

    sablah.nameEn = nameEn.trim();
    sablah.nameAr = nameAr.trim();
    sablah.governorate = governorate.trim();
    sablah.wilayat = wilayat.trim();
    sablah.area = wilayat.trim();
    sablah.capacity = Number(capacity);
    sablah.price = Number(price);
    sablah.address = address.trim();
    sablah.locationLat = Number.isFinite(Number(locationLat)) ? Number(locationLat) : null;
    sablah.locationLng = Number.isFinite(Number(locationLng)) ? Number(locationLng) : null;
    sablah.descriptionEn = descriptionEn || "";
    sablah.descriptionAr = descriptionAr || "";
    sablah.amenities = parseAmenities(amenities);
    sablah.images = allImages;
    sablah.image = allImages[0] || "";

    await sablah.save();

    const removedImages = oldImages.filter(
      (image) => !keptImages.includes(image)
    );

    deleteImageFiles(removedImages);

    return res.status(200).json({
      message: "Sablah updated successfully.",
      sablah
    });
  } catch (error) {
    console.error("Update Sablah Error:", error);
    deleteImageFiles(uploadedImages);
    return res.status(500).json({
      message: "Failed to update sablah."
    });
  }
};

// DELETE OWNER'S SABLAH
exports.deleteSablah = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid sablah ID."
      });
    }

    const sablah = await Sablah.findOneAndDelete({
      _id: id,
      owner: req.user.id
    });

    if (!sablah) {
      return res.status(404).json({
        message: "Sablah not found."
      });
    }

    const images = sablah.images?.length
      ? sablah.images
      : [sablah.image];

    deleteImageFiles(images);

    return res.status(200).json({
      message: "Sablah deleted successfully."
    });
  } catch (error) {
    console.error("Delete Sablah Error:", error);
    return res.status(500).json({
      message: "Failed to delete sablah."
    });
  }
};
