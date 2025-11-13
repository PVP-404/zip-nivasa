const MenuSection = ({ menu }) => (
  <div className="mt-6 bg-white p-6 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-3">Menu</h2>
    <ul className="list-disc ml-6">
      {menu.map((item, i) => (
        <li key={i} className="text-gray-700">{item}</li>
      ))}
    </ul>
  </div>
);

export default MenuSection;
