const RestaurantList = ({ restaurants, onDelete, onSelect }) => {
  return (
    <>

      {restaurants.map((r) => (
        <div
          className="shadow-sm"
          style={{ backgroundColor: "#F0E5CF", color: "#4B6587", cursor: "pointer", borderRadius: "50%", width: "3.5rem", height: "3.5rem", textAlign: "center" }}
          onClick={() => onSelect(r)}
          onSelect={(r) => selectRestaurant(r)}
          key={r.id}
        >
          <div style={{ fontSize: "2rem" }}>{r.name[0]}</div>
        </div>
      ))}

    </>

  );
};

export default RestaurantList;