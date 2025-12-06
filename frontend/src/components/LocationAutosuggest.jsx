import React, { useState } from "react";
import axios from "axios";

const LocationAutosuggest = ({ value, onChange }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSuggestions = async (text) => {
        if (!text.trim()) return setSuggestions([]);

        setLoading(true);

        try {
            const res = await axios.get(
                `http://localhost:5000/api/map/autosuggest?query=${text}`
            );

            setSuggestions(res.data.suggestions || []);
        } catch (err) {
            console.error("Autosuggest error:", err);
        }

        setLoading(false);
    };

    const handleInput = (e) => {
        const text = e.target.value;
        onChange(text);
        fetchSuggestions(text);
    };

    const handleSelect = (item) => {
        const fullAddress = `${item.placeName}, ${item.placeAddress}`;
        onChange(fullAddress);
        setSuggestions([]);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={handleInput}
                placeholder="Hinjewadi, Baner, Akurdi..."
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-200/50 text-base font-medium"
            />

            {suggestions.length > 0 && (
                <div className="absolute mt-1 w-full bg-white shadow-xl rounded-xl border max-h-60 overflow-y-auto z-50">

                    {loading && (
                        <p className="p-2 text-sm text-slate-500">Loading…</p>
                    )}

                    {suggestions.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleSelect(item)}
                            className="p-3 hover:bg-emerald-50 cursor-pointer border-b"
                        >
                            <p className="font-semibold">{item.placeName}</p>
                            <p className="text-sm text-slate-500">{item.placeAddress}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationAutosuggest;
