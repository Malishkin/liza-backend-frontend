const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: false,
  },
  images: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "uploads.files",
    },
  ],
  shortImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "uploads.files",
  },
});

module.exports = mongoose.model("Item", ItemSchema);
