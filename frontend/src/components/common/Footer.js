import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light py-3 mt-auto">
      <Container fluid>
        <Row>
          <Col className="text-center text-muted">
            <small>
              © {currentYear} Employee Leave Management System. All rights reserved.
            </small>
          </Col>
        </Row>
        <Row>
          <Col className="text-center text-muted">
            <small>
              Version 1.0.0 | Built with React & Spring Boot
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
