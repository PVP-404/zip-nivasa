// frontend/pages/mess/components/MenuSection.jsx
import React from "react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Expected menu format:
 * menu = [
 *   "Monday Lunch",
 *   "Monday Dinner",
 *   "Tuesday Lunch",
 *   "Tuesday Dinner",
 *   ...
 * ]
 *
 * We map: 
 * index 0 → Monday Lunch
 * index 1 → Monday Dinner
 * index 2 → Tuesday Lunch
 * index 3 → Tuesday Dinner
 * ...
 */

const MenuSection = ({ menu }) => {
  if (!menu || menu.length === 0) {
    return (
      <div className="text-center py-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Weekly Menu</h2>
        <p className="text-sm text-gray-500">No menu available.</p>
      </div>
    );
  }

  // Convert array → day-wise structure (2 items per day)
  const normalisedMenu = DAYS.map((day, index) => {
    const lunchIndex = index * 2;      // 0, 2, 4, 6, ...
    const dinnerIndex = lunchIndex + 1;

    const lunch =
      typeof menu[lunchIndex] === "string"
        ? menu[lunchIndex].split(",").map((i) => i.trim())
        : [];

    const dinner =
      typeof menu[dinnerIndex] === "string"
        ? menu[dinnerIndex].split(",").map((i) => i.trim())
        : [];

    return {
      day,
      lunch,
      dinner,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Weekly Menu</h2>
        <p className="text-xs text-gray-400">
          Tap a card to quickly glance day-wise meals
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {normalisedMenu.map(({ day, lunch, dinner }) => (
          <div
            key={day}
            className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm hover:shadow-md transition-transform duration-150 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-800">{day}</h3>
              <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold uppercase tracking-wide">
                {lunch.length || dinner.length ? "Available" : "No Menu"}
              </span>
            </div>

            {/* Lunch Section */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Lunch
              </p>
              {lunch.length ? (
                <ul className="flex flex-wrap gap-1">
                  {lunch.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">Not specified</p>
              )}
            </div>

            {/* Dinner Section */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Dinner
              </p>
              {dinner.length ? (
                <ul className="flex flex-wrap gap-1">
                  {dinner.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">Not specified</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuSection;
