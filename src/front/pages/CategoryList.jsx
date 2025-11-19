import { Row, Col, Card } from "react-bootstrap";

const CategoryList = ({ categories }) => {
  return (
    <Row className="g-3 mb-5">
      {categories.map((cat, idx) => (
        <Col key={idx} xs={6} md={3} lg={2}>
          <Card
            className="text-center p-3 shadow-sm"
            style={{ backgroundColor: "#F0E5CF", color: "#4B6587" }}
          >
            <Card.Body>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#F9C784",
                  color: "#4B6587",
                  fontSize: "18px",
                }}
              >
                {cat.name[0].toUpperCase()}
              </div>
              <Card.Title>{cat.name}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CategoryList;