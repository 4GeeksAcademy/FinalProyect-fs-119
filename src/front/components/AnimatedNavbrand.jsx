import React from "react";
// Si usas React Router:
import { Link } from "react-router-dom";

import './AnimatedNavbrand.css'; // Importaríamos el nuevo CSS

const PlateIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
  </svg>
);

export function AnimatedNavbrand() {
  return (
    <div className="animated-navbrand-group" aria-hidden="true">
      <PlateIcon className="plate-icon" />
      <div className="brand-text-container" aria-hidden="true">
        <span>s</span>
        <div className="animated-chars" style={{ '--delay': '75ms' }}>
          <span>et</span>
        </div>
        <span className="accent-char">a</span>
        <div className="animated-chars" style={{ '--delay': '150ms' }}>
          <span>mea</span>
        </div>
        <span>l</span>
      </div>
    </div>
  );
}