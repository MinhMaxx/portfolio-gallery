import React, { useRef } from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import "./AboutMe.css";
import Employment from "./About Me Tabs/Employment";
import Education from "./About Me Tabs/Education";
import Certification from "./About Me Tabs/Certificates";

const AboutMe = () => {
  // Anchor just above the about-me tab content we want to align to
  const contentTopAnchorRef = useRef(null);

  const handleSelect = () => {
    // Scroll viewport so that the content area sits just below the navbar
    const anchorEl = contentTopAnchorRef.current;
    if (!anchorEl) return;
    // Determine current navbar height dynamically for all breakpoints
    const navbarEl = document.querySelector(".my-navbar");
    const navbarHeight = navbarEl ? navbarEl.offsetHeight : 80;
    const extraSpacing = 16; // small buffer so content header is not hidden
    const rect = anchorEl.getBoundingClientRect();
    const absoluteTop =
      window.pageYOffset + rect.top - (navbarHeight + extraSpacing);
    window.scrollTo({ top: absoluteTop, behavior: "smooth" });
  };

  return (
    <section id="aboutme" className="aboutme">
      <h1>About Me</h1>

      <p>
        I’m a Full Stack Developer passionate about building impactful software
        and collaborating on solutions that make work more efficient.
      </p>
      {/* Create a tab container with the default active tab set to "employment" */}
      <Tab.Container defaultActiveKey="employment" onSelect={handleSelect}>
        <Row>
          {/* Create a column for the tab navigation */}
          <Col sm={3} className="aboutme-sidebar">
            {/* Define a vertical tab navigation with pills style */}
            <Nav variant="pills" className="flex-column">
              {/* Create tabs for "Employment," "Education," and "Certificates" */}
              <Nav.Item>
                {/* Set the event key for the "Employment" tab */}
                <Nav.Link eventKey="employment">Employment</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                {/* Set the event key for the "Education" tab */}
                <Nav.Link eventKey="education">Education</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                {/* Set the event key for the "Certificates" tab */}
                <Nav.Link eventKey="certificates">Certificates</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          {/* Create a column to display tab content */}
          <Col sm={9}>
            {/* anchor target for scroll alignment on tab change */}
            <div ref={contentTopAnchorRef} />
            <Tab.Content>
              {/* Define the content for the "Employment" tab */}
              <Tab.Pane eventKey="employment">
                {/* Render the "Employment" component */}
                <Employment />
              </Tab.Pane>
              {/* Define the content for the "Education" tab */}
              <Tab.Pane eventKey="education">
                {/* Render the "Education" component */}
                <Education />
              </Tab.Pane>
              {/* Define the content for the "Certificates" tab */}
              <Tab.Pane eventKey="certificates">
                {/* Render the "Certificates" component */}
                <Certification />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </section>
  );
};

export default AboutMe;
