const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Подключение к MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;

conn.once("open", () => {
  console.log("MongoDB connected");
});

conn.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Схема для элемента с изображением
const itemSchema = new mongoose.Schema({
  category: String,
  images: [String], // Здесь будут храниться пути к изображениям
  shortImage: String,
});

const Item = mongoose.model("Item", itemSchema);

// Схема для страницы "About"
const aboutSchema = new mongoose.Schema({
  content: String,
  image: String,
});

const About = mongoose.model("About", aboutSchema);

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Получить все элементы
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Создать новый элемент
app.post("/api/items", upload.array("images", 10), async (req, res) => {
  try {
    const imagePaths = req.files.map(
      (file) => `uploads/${file.filename.replace(/\\/g, "/")}`
    );
    const shortImage = imagePaths[0];

    const item = new Item({
      category: req.body.category,
      images: imagePaths,
      shortImage: shortImage,
    });

    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Обновить элемент
app.put("/api/items/:id", upload.array("images", 10), async (req, res) => {
  try {
    const imagePaths = req.files.length
      ? req.files.map((file) => `uploads/${file.filename}`)
      : undefined;
    const shortImage = imagePaths ? imagePaths[0] : undefined;

    const updateData = {
      category: req.body.category,
      ...(imagePaths && { images: imagePaths, shortImage }),
    };

    const item = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Удалить элемент
app.delete("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Получить содержимое страницы "About"
app.get("/api/about", async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Обновить содержимое страницы "About"
app.put("/api/about", upload.single("image"), async (req, res) => {
  try {
    const { content } = req.body;
    const image = req.file
      ? `uploads/${req.file.filename.replace(/\\/g, "/")}`
      : undefined;

    let about = await About.findOne();
    if (about) {
      about.content = content;
      if (image) {
        about.image = image;
      }
    } else {
      about = new About({ content, image });
    }

    const updatedAbout = await about.save();
    res.json(updatedAbout);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Статическая папка для загрузок
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
