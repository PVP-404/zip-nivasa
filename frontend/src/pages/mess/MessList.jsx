// frontend/src/components/mess/MessList.jsx

import React from "react";
import { FaStar } from "react-icons/fa";

const MessList = ({ messes, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {messes.length === 0 ? (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500 font-medium text-lg">No mess services found.</p>
          <p className="text-sm text-gray-400">Try adjusting your search.</p>
        </div>
      ) : (
        messes.map((mess) => (
          <div
            key={mess.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelect(mess)}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-lg text-gray-900 truncate">
                  {mess.name}
                </h4>
                <p className="text-sm text-gray-600">{mess.location}</p>
              </div>

              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                {mess.type}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              <FaStar className="text-yellow-400 w-4 h-4" />
              <span className="text-sm font-semibold text-gray-700">
                {mess.rating}
              </span>
            </div>

            {/* Price */}
            <p className="text-lg font-bold text-gray-900 mb-4">
              ₹{mess.price}/month
            </p>

            {/* CTA Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent parent click
                onSelect(mess);
              }}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              View Menu
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default MessList;
