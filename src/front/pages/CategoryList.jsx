import { Row, Col, Card, Button } from "react-bootstrap";

const CategoryList = ({ categories = [], onDelete }) => {
  // Filtramos valores inválidos
  const safeCategories = categories.filter(cat => cat && cat.name);

  return (
    <Row className="g-3 mb-5">
      {safeCategories.map((cat) => (
        <Col key={cat.id} xs={6} md={3} lg={2}>
          <Card
            className="text-center p-3 shadow-sm"
            style={{ backgroundColor: "#F0E5CF", color: "#4B6587", position: "relative" }}
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
                {cat.name[0]?.toUpperCase() || "?"}
              </div>
              <Card.Title>{cat.name || "Sin nombre"}</Card.Title>

              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  style={{ position: "absolute", top: "5px", right: "5px" }}
                  onClick={() => onDelete(cat.id)}
                >
                  &times;
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CategoryList;
