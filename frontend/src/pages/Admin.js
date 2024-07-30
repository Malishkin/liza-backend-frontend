import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Admin.css";

const Admin = () => {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [error, setError] = useState(""); // State for error message
  const fileInputRef = useRef(null); // Use ref to access file input
  const formRef = useRef(null); // Use ref to access form container
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const confirmDialogRef = useRef(null); // Use ref to access confirm dialog

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (showConfirm) {
      confirmDialogRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showConfirm]);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
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
        await axios.put(
          `http://localhost:5000/api/items/${editItem._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setEditItem(null);
      } else {
        await axios.post("http://localhost:5000/api/items", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      setCategory("");
      setFiles([]);
      setError(""); // Clear error message
      fileInputRef.current.value = ""; // Clear file input
      fetchItems();
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setCategory(item.category);
    setFiles([]);
    fileInputRef.current.value = ""; // Clear file input
    formRef.current.scrollIntoView({ behavior: "smooth" }); // Scroll to form container
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/items/${deleteItemId}`);
      fetchItems();
      setShowConfirm(false); // Close confirmation dialog
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false); // Close confirmation dialog
    setDeleteItemId(null); // Clear delete item ID
  };

  const showDeleteConfirm = (id) => {
    setDeleteItemId(id);
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setEditItem(null);
    setCategory("");
    setFiles([]);
    fileInputRef.current.value = ""; // Clear file input
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
            ref={fileInputRef} // Reference file input
          />
        </div>
        {error && <p className="error">{error}</p>}{" "}
        {/* Display error message */}
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
                  src={`http://localhost:5000/${image}`}
                  alt="Work"
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    margin: "5px",
                  }}
                />
              ))}
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => showDeleteConfirm(item._id)}>
                Delete
              </button>
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
    </div>
  );
};

export default Admin;
