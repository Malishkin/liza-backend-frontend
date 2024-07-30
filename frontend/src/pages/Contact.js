import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import Modal from "react-modal";
import "./Contact.css";
import { FaInstagram } from "react-icons/fa";

Modal.setAppElement("#root"); // This is important for accessibility

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_USER_ID
      )
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          setModalMessage("Message sent successfully!");
          setModalIsOpen(true);
        },
        (err) => {
          console.log("FAILED...", err);
          setModalMessage("Failed to send message. Please try again.");
          setModalIsOpen(true);
        }
      );

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const handleModalClose = (e) => {
    if (e.type === "click" || (e.type === "keydown" && e.key === "Enter")) {
      setModalIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (modalIsOpen) {
      const closeModalOnEnter = (e) => {
        if (e.key === "Enter") {
          setModalIsOpen(false);
        }
      };
      window.addEventListener("keydown", closeModalOnEnter);
      return () => {
        window.removeEventListener("keydown", closeModalOnEnter);
      };
    }
  }, [modalIsOpen]);

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit">Send</button>
      </form>
      <div className="social-follow">
        <a
          href="https://www.instagram.com/el.messeg?igsh=MWdiZmloZXRhbXhuNQ=="
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-follow"
        >
          <FaInstagram /> Follow on Instagram
        </a>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Message Status"
        className="modal"
        overlayClassName="overlay"
        onKeyDown={handleModalClose}
      >
        <h2>{modalMessage}</h2>
        <button onClick={handleModalClose}>Close</button>
      </Modal>
    </div>
  );
};

export default Contact;
