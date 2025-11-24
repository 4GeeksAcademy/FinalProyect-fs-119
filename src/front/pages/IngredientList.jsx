import React from "react";
import { Card, Button } from "react-bootstrap";

const IngredientList = ({ ingredients, onDelete,onSelect }) => {
  return (
    <div>
      <div className="row">
        {ingredients.map((ing) => (
          <div key={ing.id} className="col-12 col-md-6 col-lg-4 mb-3">
            <Card
            className="shadow-sm"
            style={{ backgroundColor: "#F0E5CF", color: "#4B6587", cursor: "pointer" }}
            
          >
              <Card.Body>
                <Card.Title>{ing.name}</Card.Title>
                <p>Precio: {ing.price_per_unit} / {ing.unit}</p>
                <Button variant="danger" onClick={() => onDelete(ing.id)}>Eliminar</Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IngredientList;
