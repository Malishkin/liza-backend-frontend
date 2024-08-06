const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

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

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const itemSchema = new mongoose.Schema({
  category: String,
  images: [String],
  shortImage: String,
});

const Item = mongoose.model("Item", itemSchema);

const aboutSchema = new mongoose.Schema({
  content: String,
  image: String,
});

const About = mongoose.model("About", aboutSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

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

app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post(
  "/api/items",
  authMiddleware,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const imagePaths = req.files.map(
        (file) => `/uploads/${file.filename.replace(/\\/g, "/")}`
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
  }
);

app.put(
  "/api/items/:id",
  authMiddleware,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const imagePaths = req.files.length
        ? req.files.map((file) => `/uploads/${file.filename}`)
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
  }
);

app.delete("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/about", async (req, res) => {
  try {
    const aboutContent = await About.findOne();
    res.json(aboutContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put(
  "/api/about",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const updateData = {
        content: req.body.content,
        ...(req.file && { image: `/uploads/${req.file.filename}` }),
      };

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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
