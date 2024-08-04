import React, { useState, useEffect, useRef } from "react";
import axios from "../axiosConfig"; // Импортируйте настроенный axios из вашего файла axiosConfig
import "./Admin.css";

const Admin = () => {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
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
    if (files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    files.forEach((file) => formData.append("images", file));

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
      setFiles([]);
      setError("");
      fileInputRef.current.value = "";
      fetchItems();
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setCategory(item.category);
    setFiles([]);
    fileInputRef.current.value = "";
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/items/${deleteItemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchItems();
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
        <div>
          <button type="submit">{editItem ? "Update" : "Upload"}</button>
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
              {item.images.map((image, index) => (
                <img
                  key={index}
                  src={`${axios.defaults.baseURL}/${image}`}
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
          <button onClick={handleDelete}>Delete</button>
          <button onClick={handleCancelDelete}>Cancel</button>
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
              src={`${axios.defaults.baseURL}/${aboutImage}`}
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
