import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import Slider from "react-slick";
import "./Testimonials.css";
import { testimonials } from "../data";

const Testimonials = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1320,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section id="testimonials" className="testimonials">
      <Container fluid>
        <h1>Testimonials</h1>
        <p>
          These testimonials offer a glimpse into my professional conduct, skill
          set, and dedication to every project I undertake.
        </p>
        <Row className="align-items-center">
          <Col lg={9}>
            <Slider {...settings}>
              {testimonials.map((testimonial) => (
                <Col key={testimonial._id} className="mb-4">
                  <Card className="testimonial-card">
                    <Card.Body>
                      <Card.Text>
                        <i className="fa fa-quote-left" aria-hidden="true"></i>{" "}
                        {testimonial.content}{" "}
                        <i className="fa fa-quote-right" aria-hidden="true"></i>
                      </Card.Text>
                      <Card.Title>
                        {testimonial.name}{" "}
                        <i
                          className="fa fa-user-circle-o"
                          aria-hidden="true"
                        ></i>
                      </Card.Title>
                      <Card.Subtitle className="mb-2">
                        {testimonial.position} at {testimonial.company}
                      </Card.Subtitle>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Slider>
          </Col>
          <Col lg={3}>
            <div className="testimonial-form" style={{ textAlign: "center", padding: "30px 20px" }}>
              <h5 style={{ marginBottom: "16px" }}>This is a demo version</h5>
              <p style={{ fontSize: "14px", color: "#aaa", margin: 0 }}>
                Testimonial submissions are disabled in this preview.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Testimonials;
