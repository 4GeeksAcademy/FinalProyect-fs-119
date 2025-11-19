import React from "react";
import { Button } from "react-bootstrap";

const Sidebar = ({ onOpenRestaurantModal }) => {
  return (
    <div
      className="d-flex flex-column align-items-center p-3"
      style={{ width: "80px", backgroundColor: "#1B1B1B" }}
    >
      <Button
        className="mb-3"
        style={{ backgroundColor: "#F9C784", color: "#4B6587", border: "none" }}
        onClick={onOpenRestaurantModal}
      >
        🍴
      </Button>
    </div>
  );
};

export default Sidebar;