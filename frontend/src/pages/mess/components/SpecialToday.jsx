//pages/mess/components/SpecialToday.jsx
const SpecialToday = ({ special }) => {
  if (!special) return null;

  return (
    <div className="bg-white p-6 mt-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-3">Today's Special</h2>

      {special.imageUrl && (
        <img
          src={special.imageUrl}
          className="w-40 rounded-lg mb-3"
          alt="Today's Special"
        />
      )}

      <p>🍽️ Lunch: {special.lunch}</p>
      <p>🌙 Dinner: {special.dinner}</p>
    </div>
  );
};

export default SpecialToday;
