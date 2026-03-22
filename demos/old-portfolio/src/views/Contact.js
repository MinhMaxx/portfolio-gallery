import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import "./Contact.css";

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Demo Mode",
      text: "This is a demo version — messages are not sent. Visit my new portfolio to get in touch!",
      icon: "info",
      background: "#333",
      customClass: {
        title: "text-light",
      },
      showConfirmButton: true,
      confirmButtonColor: "#fad027",
    });
  };

  return (
    <section id="contact" className="contact">
      <Container fluid>
        <h1>Contact Me</h1>
        <p>
          Reach out to me through the contact form, connect on social media, or
          download my resume for a comprehensive view of my expertise.
        </p>
        <Row>
          <Col lg={8}>
            <form onSubmit={handleSubmit} className="contact-form">
              <input type="text" name="name" placeholder="Name" required />
              <input type="email" name="email" placeholder="Email" required />
              <textarea
                name="message"
                placeholder="Your Message"
                required
                maxLength="600"
              ></textarea>
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </Col>
          <Col lg={4}>
            <div className="profile-section">
              <img
                src="https://i.imgur.com/YPDTDpN.jpeg"
                alt="Your Profile"
                className="profile-image"
              />
              <div className="social-media-icons contact-social-media-icons">
                <span className="nav-link" style={{ cursor: "default" }}>
                  <i className="fa fa-linkedin-square" aria-hidden="true"></i>
                </span>
                <span className="nav-link" style={{ cursor: "default" }}>
                  <i className="fa fa-github" aria-hidden="true"></i>
                </span>
                <span className="nav-link" style={{ cursor: "default" }}>
                  <i className="fa fa-instagram" aria-hidden="true"></i>
                </span>
              </div>
              <span
                className="btn btn-download-resume"
                style={{ cursor: "default", opacity: 0.7 }}
              >
                Download My R&eacute;sum&eacute;
              </span>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Contact;
