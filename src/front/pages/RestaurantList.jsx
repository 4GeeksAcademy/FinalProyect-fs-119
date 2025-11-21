import { Row, Col, Card } from "react-bootstrap";

const RestaurantList = ({ restaurants, onDelete, onSelect }) => {
  return (
    <Row className="g-3">
      {restaurants.map((r) => (
        <Col key={r.id} xs={12} md={6} lg={4}>
          <Card
            className="shadow-sm"
            style={{ backgroundColor: "#F0E5CF", color: "#4B6587", cursor: "pointer" }}
            onClick={() => onSelect(r)}
            onSelect={(r) => selectRestaurant(r)}
          >
            <Card.Body>
              <Card.Title>{r.name}</Card.Title>
              <Card.Text>{r.telefono}</Card.Text>
              <Card.Text>{r.direccion}</Card.Text>
              <button className="btn btn-danger mt-2" onClick={(e) => { e.stopPropagation(); onDelete(r.id); }}>Eliminar</button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default RestaurantList;