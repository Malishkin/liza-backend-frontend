import React, { useState, useEffect, useRef } from "react";
import axios from "../axiosConfig";
import "./Admin.css";

const Admin = () => {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [metaPage, setMetaPage] = useState(""); // Добавлено поле для выбора страницы
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [files, setFiles] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const confirmDialogRef = useRef(null);
  const [aboutContent, setAboutContent] = useState("");
  const [aboutImage, setAboutImage] = useState(null);
  const aboutImageRef = useRef(null);

  useEffect(() => {
    fetchItems();
    fetchAboutContent();
  }, []);

  useEffect(() => {
    if (showConfirm) {
      confirmDialogRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showConfirm]);

  const fetchItems = async () => {
    try {
      const response = await axios.get("/api/items", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchAboutContent = async () => {
    try {
      const response = await axios.get("/api/about", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data) {
        setAboutContent(response.data.content);
        setAboutImage(response.data.image);
      }
    } catch (error) {
      console.error("Error fetching about content:", error);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    if (files.length > 0) {
      formData.append("category", category);
      files.forEach((file) => formData.append("images", file));
    } else if (!category && !metaTitle && !metaDescription && !metaKeywords) {
      setError("Please fill out at least one field.");
      return;
    }

    formData.append("metaTags[page]", metaPage); // Добавлено поле страницы
    formData.append("metaTags[title]", metaTitle);
    formData.append("metaTags[description]", metaDescription);
    formData.append("metaTags[keywords]", metaKeywords);

    try {
      if (editItem) {
        await axios.put(`/api/items/${editItem._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setEditItem(null);
      } else {
        await axios.post("/api/items", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }
      setCategory("");
      setMetaPage(""); // Сброс поля страницы
      setMetaTitle("");
      setMetaDescription("");
      setMetaKeywords("");
      setFiles([]);
      setError("");
      fileInputRef.current.value = "";
      fetchItems(); // Обновляем список элементов после добавления/редактирования
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleMetaTagsSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("category", category);
    formData.append("metaTags[page]", metaPage); // Добавлено поле страницы
    formData.append("metaTags[title]", metaTitle);
    formData.append("metaTags[description]", metaDescription);
    formData.append("metaTags[keywords]", metaKeywords);

    try {
      if (editItem) {
        await axios.put(`/api/items/${editItem._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setEditItem(null);
      } else {
        await axios.post("/api/items", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }
      setCategory("");
      setMetaPage(""); // Сброс поля страницы
      setMetaTitle("");
      setMetaDescription("");
      setMetaKeywords("");
      setError("");
      fetchItems(); // Обновляем список элементов после добавления/редактирования
    } catch (error) {
      console.error("Error uploading meta tags:", error);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setCategory(item.category);
    setMetaPage(item.metaTags?.page || ""); // Устанавливаем страницу при редактировании
    setMetaTitle(item.metaTags?.title || "");
    setMetaDescription(item.metaTags?.description || "");
    setMetaKeywords(item.metaTags?.keywords || "");
    setFiles([]);
    fileInputRef.current.value = "";
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/items/${deleteItemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchItems(); // Обновляем список элементов после удаления
      setShowConfirm(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteItemId(null);
  };

  const showDeleteConfirm = (id) => {
    setDeleteItemId(id);
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setEditItem(null);
    setCategory("");
    setMetaPage(""); // Сброс поля страницы
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setFiles([]);
    fileInputRef.current.value = "";
  };

  const handleAboutSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", aboutContent);
    if (aboutImage) formData.append("image", aboutImage);

    try {
      await axios.put("/api/about", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("About content updated successfully!");
      fetchAboutContent();
    } catch (error) {
      console.error("Error updating about content:", error);
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>
      <form ref={formRef} onSubmit={handleSubmit}>
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          name="metaPage"
          placeholder="Page (e.g., Work, About)"
          value={metaPage}
          onChange={(e) => setMetaPage(e.target.value)}
        />
        <input
          type="text"
          name="metaTitle"
          placeholder="Meta Title"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
        />
        <input
          type="text"
          name="metaDescription"
          placeholder="Meta Description"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
        />
        <input
          type="text"
          name="metaKeywords"
          placeholder="Meta Keywords"
          value={metaKeywords}
          onChange={(e) => setMetaKeywords(e.target.value)}
        />
        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p>Drag and drop files here, or click to select files</p>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            ref={fileInputRef}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="update-cancel">
          <button type="submit">{editItem ? "Update" : "Upload"}</button>
          {editItem && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <form ref={formRef} onSubmit={handleMetaTagsSubmit}>
        <h3>Update Meta Tags Only</h3>
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          name="metaPage"
          placeholder="Page (e.g., Work, About)"
          value={metaPage}
          onChange={(e) => setMetaPage(e.target.value)}
        />
        <input
          type="text"
          name="metaTitle"
          placeholder="Meta Title"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
        />
        <input
          type="text"
          name="metaDescription"
          placeholder="Meta Description"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
        />
        <input
          type="text"
          name="metaKeywords"
          placeholder="Meta Keywords"
          value={metaKeywords}
          onChange={(e) => setMetaKeywords(e.target.value)}
        />
        <div className="update-cancel">
          <button type="submit">Update Meta Tags</button>
          {editItem && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="files-list">
        <h3>Selected Files:</h3>
        <ul>
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      </div>
      <div className="items-list">
        <h3>Items:</h3>
        <ul>
          {items.map((item) => (
            <li key={item._id}>
              <h4>{item.category}</h4>
              <p>Page: {item.metaTags?.page || "N/A"}</p>{" "}
              {/* Показываем страницу метатегов */}
              <p>Meta Title: {item.metaTags?.title || "N/A"}</p>
              <p>Meta Description: {item.metaTags?.description || "N/A"}</p>
              <p>Meta Keywords: {item.metaTags?.keywords || "N/A"}</p>
              {item.images.map((image, index) => (
                <img
                  key={index}
                  src={`${axios.defaults.baseURL}${image}`}
                  alt="Work"
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    margin: "5px",
                  }}
                />
              ))}
              <div className="buttons-display">
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => showDeleteConfirm(item._id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {showConfirm && (
        <div className="confirm-dialog" ref={confirmDialogRef}>
          <p>Are you sure you want to delete this item?</p>
          <div className="update-cancel">
            <button onClick={handleDelete}>Delete</button>
            <button onClick={handleCancelDelete}>Cancel</button>
          </div>
        </div>
      )}
      <div className="about-edit">
        <h3>Edit About Page</h3>
        <form onSubmit={handleAboutSubmit}>
          <textarea
            value={aboutContent}
            onChange={(e) => setAboutContent(e.target.value)}
            rows="10"
            cols="50"
          ></textarea>
          <input
            type="file"
            onChange={(e) => setAboutImage(e.target.files[0])}
            ref={aboutImageRef}
          />
          {aboutImage && <p>Selected Image: {aboutImage.name}</p>}
          <button type="submit">Update About</button>
        </form>
        {aboutImage && (
          <div className="about-preview">
            <h4>Current Image:</h4>
            <img
              src={`${axios.defaults.baseURL}${aboutImage}`}
              alt="About"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                margin: "10px",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
