const HeroHome = () => {
  return (
    <div
      className="p-5 mb-4 rounded-3 shadow-sm text-center"
      style={{ backgroundColor: "#4B6587", color: "#F9C784" }}
    >
      <h1 className="display-4 fw-bold">DISHCOST</h1>
      <p className="fs-5" style={{ color: "#EDEDED" }}>
        Optimiza tus escandallos y gestiona tu restaurante u hotel con precisión.
      </p>
      <button className="btn" style={{ backgroundColor: "#F9C784", color: "#4B6587" }}>
        Explora más
      </button>
    </div>
  );
};

export default HeroHome;