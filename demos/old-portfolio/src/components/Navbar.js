import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { Navbar, Nav } from "react-bootstrap";
import "./Navbar.css";

const MyNavbar = () => {
  const location = useLocation();
  const is404 = location.pathname === "/404";
  const [activeLinkColor, setActiveLinkColor] = useState("#fad027");

  const handleSetActive = (to) => {
    const colors = {
      home: "#fad027",
      aboutme: "#febc35",
      projects: "#ffa041",
      testimonials: "#ff9246",
      contact: "#ff7c4a",
    };
    setActiveLinkColor(colors[to]);
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      fixed="top"
      expand="lg"
      className="my-navbar"
    >
      <Navbar.Brand
        href="#/"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <img
          src={`${process.env.PUBLIC_URL}/logo_full.png`}
          alt="Logo"
          height="20"
          className="d-inline-block align-top"
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          {is404 ? (
            <Nav.Link as={Link} to="/">home</Nav.Link>
          ) : (
            <Nav.Link
              as={ScrollLink}
              to="home"
              smooth={true}
              duration={500}
              spy={true}
              activeClass="active"
              offset={-120}
              isDynamic={true}
              onSetActive={() => handleSetActive("home")}
              style={activeLinkColor === "#fad027" ? { color: "#fad027" } : {}}
            >
              home
            </Nav.Link>
          )}

          {is404 ? (
            <Nav.Link as={Link} to="/">about me</Nav.Link>
          ) : (
            <Nav.Link
              as={ScrollLink}
              to="aboutme"
              smooth={true}
              duration={500}
              spy={true}
              activeClass="active"
              offset={-120}
              isDynamic={true}
              onSetActive={() => handleSetActive("aboutme")}
              style={activeLinkColor === "#febc35" ? { color: "#febc35" } : {}}
            >
              about me
            </Nav.Link>
          )}
          {is404 ? (
            <Nav.Link as={Link} to="/">projects</Nav.Link>
          ) : (
            <Nav.Link
              as={ScrollLink}
              to="projects"
              smooth={true}
              duration={500}
              spy={true}
              activeClass="active"
              offset={-120}
              isDynamic={true}
              onSetActive={() => handleSetActive("projects")}
              style={activeLinkColor === "#ffa041" ? { color: "#ffa041" } : {}}
            >
              projects
            </Nav.Link>
          )}

          {is404 ? (
            <Nav.Link as={Link} to="/">testimonials</Nav.Link>
          ) : (
            <Nav.Link
              as={ScrollLink}
              to="testimonials"
              smooth={true}
              duration={500}
              spy={true}
              activeClass="active"
              offset={-200}
              isDynamic={true}
              onSetActive={() => handleSetActive("testimonials")}
              style={activeLinkColor === "#ff9246" ? { color: "#ff9246" } : {}}
            >
              testimonials
            </Nav.Link>
          )}

          {is404 ? (
            <Nav.Link as={Link} to="/">contact</Nav.Link>
          ) : (
            <Nav.Link
              as={ScrollLink}
              to="contact"
              smooth={true}
              duration={500}
              spy={true}
              activeClass="active"
              offset={-200}
              isDynamic={true}
              onSetActive={() => handleSetActive("contact")}
              style={activeLinkColor === "#ff7c4a" ? { color: "#ff7c4a" } : {}}
            >
              contact
            </Nav.Link>
          )}
        </Nav>
        <div className="social-icons">
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
      </Navbar.Collapse>
    </Navbar>
  );
};

export default MyNavbar;
