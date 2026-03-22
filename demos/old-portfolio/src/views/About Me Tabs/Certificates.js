import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import "./Certificates.css";
import { certificates } from "../../data";

const Certificates = () => {
  return (
    <section id="certificates" className="certificates">
      <Container>
        <Row>
          {certificates.map((certificate) => (
            <Col md={12} lg={6} xl={4} key={certificate._id} className="mb-4">
              <Card className="certificate-card">
                <Card.Body>
                  <Card.Title>
                    <span className="certificate-link">
                      {certificate.certificateName} -{" "}
                      {certificate.organization}
                    </span>
                  </Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Issued{" "}
                    {new Date(certificate.dateReceived).getFullYear()}
                  </Card.Subtitle>
                  <Card.Text>{certificate.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Certificates;
