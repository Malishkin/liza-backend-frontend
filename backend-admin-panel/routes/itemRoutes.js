const express = require("express");
const mongoose = require("mongoose");
const Item = require("../models/Item");

module.exports = (upload, gfs) => {
  const router = express.Router();

  // Получить все элементы
  router.get("/", async (req, res) => {
    try {
      const items = await Item.find().populate("images shortImage");
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Создать новый элемент
  router.post("/", upload.array("images"), async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const imageFiles = req.files.map((file) => file.id);
    const shortImage = imageFiles[0];

    const item = new Item({
      category: req.body.category,
      images: imageFiles,
      shortImage: shortImage,
    });

    try {
      const newItem = await item.save();
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // Удалить элемент
  router.delete("/:id", async (req, res) => {
    try {
      await Item.findByIdAndDelete(req.params.id);
      res.json({ message: "Item deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Получить изображение по id
  router.get("/image/:id", (req, res) => {
    gfs.files.findOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      (err, file) => {
        if (!file || file.length === 0) {
          return res.status(404).json({ err: "No file exists" });
        }

        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      }
    );
  });

  return router;
};
