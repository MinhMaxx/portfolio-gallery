import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import "./Education.css";
import { degrees } from "../../data";

const Education = () => {
  return (
    <section id="education" className="education">
      <Container>
        <Row>
          {degrees.map((degree) => (
            <Col md={12} lg={6} xl={6} key={degree._id} className="mb-4">
              <Card className="degree-card">
                <Card.Body>
                  <Card.Title>
                    {degree.degree} at {degree.institution}
                  </Card.Title>
                  <Card.Text>
                    <small>
                      <strong>Field of Study:</strong> {degree.fieldOfStudy}
                    </small>
                  </Card.Text>
                  <Card.Subtitle className="mb-2 text-muted">
                    {degree.endDate
                      ? new Date(degree.endDate).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "Ongoing"}
                  </Card.Subtitle>
                  <Card.Text>{degree.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Education;
