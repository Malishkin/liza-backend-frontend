const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3"); // Обновлено для работы с S3 SDK v3

// Загрузка переменных окружения в зависимости от режима (development или production)
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.development" });
} else {
  dotenv.config({ path: ".env.production" });
}

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Подключение к MongoDB
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Проверка прав доступа к директории
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
} else {
  fs.access(uploadDir, fs.constants.W_OK, (err) => {
    if (err) {
      console.error(`No write access to uploads directory: ${err.message}`);
    } else {
      console.log("Write access to uploads directory confirmed.");
    }
  });
}

// Настройка хранилища для multer (локальное сохранение)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Настройка AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Функция для загрузки файла в S3
const uploadToS3 = async (file) => {
  const fileContent = fs.readFileSync(file.path);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file.filename,
    Body: fileContent,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log(`File uploaded successfully to S3: ${file.filename}`);
  } catch (error) {
    console.error(`Error uploading file to S3: ${error.message}`);
  }
};

// Схема для пользователя
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Схема для элемента с изображением
const itemSchema = new mongoose.Schema({
  category: String,
  images: [String], // Здесь будут храниться пути к изображениям
  shortImage: String,
});

const Item = mongoose.model("Item", itemSchema);

// Схема для страницы About
const aboutSchema = new mongoose.Schema({
  content: String,
  image: String, // Путь к изображению
});

const About = mongoose.model("About", aboutSchema);

// Регистрация пользователя (один раз для создания аккаунта)
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Авторизация пользователя
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    res.json({ success: true, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Middleware для проверки аутентификации
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Получить все элементы (открытый маршрут)
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Сохранение новых элементов с сохранением в локальное хранилище и S3
app.post(
  "/api/items",
  authMiddleware,
  upload.array("images", 10),
  async (req, res) => {
    try {
      console.log("Files uploaded:", req.files);

      // Сохранение локально
      const imagePaths = req.files.map(
        (file) => `/uploads/${file.filename.replace(/\\/g, "/")}`
      );

      // Загрузка в S3
      for (let file of req.files) {
        await uploadToS3(file);
      }

      const shortImage = imagePaths[0];

      const item = new Item({
        category: req.body.category,
        images: imagePaths,
        shortImage: shortImage,
      });

      const newItem = await item.save();
      res.status(201).json(newItem);
    } catch (err) {
      console.error("Error uploading files:", err);
      res.status(400).json({ message: err.message });
    }
  }
);

// Обновление существующих элементов с сохранением в локальное хранилище и S3
app.put(
  "/api/items/:id",
  authMiddleware,
  upload.array("images", 10),
  async (req, res) => {
    try {
      console.log("Files uploaded:", req.files);

      // Сохранение локально
      const imagePaths = req.files.length
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : undefined;

      // Загрузка в S3
      for (let file of req.files) {
        await uploadToS3(file);
      }

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
      console.error("Error updating item:", err);
      res.status(400).json({ message: err.message });
    }
  }
);

// Удалить элемент (защищенный маршрут)
app.delete("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Получить контент для страницы About (открытый маршрут)
app.get("/api/about", async (req, res) => {
  try {
    const aboutContent = await About.findOne();
    res.json(aboutContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Обновить контент страницы About (защищенный маршрут)
app.put(
  "/api/about",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const updateData = {
        content: req.body.content,
        ...(req.file && {
          image: `/uploads/${req.file.filename}`,
        }),
      };

      // Загрузка в S3
      if (req.file) {
        await uploadToS3(req.file);
      }

      const aboutContent = await About.findOneAndUpdate({}, updateData, {
        new: true,
        upsert: true,
      });
      res.json(aboutContent);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Статическая папка для загрузок
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
