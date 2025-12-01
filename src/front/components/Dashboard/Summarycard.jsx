import React from "react";

const SummaryCard = ({ number = 0, label = "", suffix = "" }) => (
  <div className="card p-3" style={{ minWidth: 160 }}>
    <div style={{ fontSize: 28, fontWeight: 700, color: "#21334a" }}>
      {number}
      {suffix}
    </div>
    <div className="text-muted">{label}</div>
  </div>
);

export default SummaryCard;