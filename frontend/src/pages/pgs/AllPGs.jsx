// ✅ frontend/src/pages/pgs/AllPGs.jsx (V3 - Enhanced UX & Aesthetics)

import React, { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

// --- Constants (Untouched) ---
const BUDGET_RANGES = [
    { label: "Below ₹5,000", max: 5000 },
    { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
    { label: "₹10,000 - ₹15,000", min: 10000, max: 15000 },
    { label: "Above ₹15,000", min: 15000, max: Infinity },
];

const PROPERTY_TYPES = [
    { label: "Boys PG", value: "boys" },
    { label: "Girls PG", value: "girls" },
    { label: "Co-Ed PG (Mixed)", value: "mixed" },
];
// --- End Constants ---


/* ----------------------------------------------------
    HELPER COMPONENT: Filter Section (For better code structure)
---------------------------------------------------- */
const FilterSection = ({ title, children }) => (
    <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-1">{title}</h3>
        {children}
    </div>
);

/* ----------------------------------------------------
    MAIN COMPONENT: AllPGs
---------------------------------------------------- */
const AllPGs = () => {
    const [pgs, setPgs] = useState([]);
    const [loading, setLoading] = useState(true);
    // ✅ New state for mobile filter toggle
    const [showFilters, setShowFilters] = useState(false); 

    // ✅ Filters State (Untouched)
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState(""); // Keeping location as a simple text input for flexibility
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [type, setType] = useState("");

    // ✅ Sorting State (Untouched)
    const [sortBy, setSortBy] = useState("recent");

    // --- Core Data Fetching Logic (Untouched) ---
    const fetchPGs = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/pgs");
            const data = await res.json();
            setPgs(data);
        } catch (err) {
            console.error("PG fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPGs();
    }, []);

    // --- Core Filtering & Sorting Logic (Untouched - optimized via useMemo) ---
    const sortedAndFilteredPGs = useMemo(() => {
        let filtered = pgs;

        if (search) {
            filtered = filtered.filter((p) =>
                p.title.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (location) {
            filtered = filtered.filter((p) =>
                p.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        if (type) {
            filtered = filtered.filter((p) => p.propertyType === type);
        }

        if (selectedBudget) {
            filtered = filtered.filter((p) => {
                const rent = p.monthlyRent;
                const min = selectedBudget.min || 0;
                const max = selectedBudget.max || Infinity;
                return rent >= min && rent <= max;
            });
        }

        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === "low-high") return a.monthlyRent - b.monthlyRent;
            if (sortBy === "high-low") return b.monthlyRent - a.monthlyRent;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return sorted;
    }, [pgs, search, location, selectedBudget, type, sortBy]);
    
    // Function to clear all filters
    const handleClearFilters = () => {
        setSearch("");
        setLocation("");
        setSelectedBudget(null);
        setType("");
        setSortBy("recent");
    };

    if (loading)
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex flex-1 justify-center items-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
                </div>
                <Footer />
            </div>
        );


    // --- Render Section (Mobile UX improvement is key here) ---
    return (
        <>
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col lg:flex-row gap-8">
                
                {/* -------------------------------------
                    ✅ MOBILE FILTER BAR / Toggle
                ------------------------------------- */}
                <div className="lg:hidden flex justify-between items-center mb-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center text-indigo-600 font-semibold text-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>
                        </svg>
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                    <button 
                        onClick={handleClearFilters}
                        className="text-sm text-gray-500 hover:text-indigo-600"
                    >
                        Clear All
                    </button>
                </div>


                {/* -------------------------------------
                    ✅ FILTER SIDEBAR (Desktop/Sticky & Mobile Toggle)
                ------------------------------------- */}
                <aside 
                    className={`lg:w-72 w-full flex-shrink-0 bg-white shadow-lg rounded-xl p-6 h-fit border border-gray-100 lg:sticky lg:top-8 space-y-6 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}
                >
                    <div className="flex justify-between items-center border-b pb-4 hidden lg:flex">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v3.414l-4 4v-4.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Refine Search
                        </h2>
                        <button 
                            onClick={handleClearFilters}
                            className="text-sm text-indigo-600 font-semibold hover:text-indigo-800"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Search / Title Filter */}
                    <FilterSection title="Search PG Name">
                        <input
                            type="text"
                            placeholder="e.g., Green PG, New Hostel..."
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </FilterSection>

                    {/* Location Filter */}
                    <FilterSection title="Location Keyword">
                        <input
                            type="text"
                            placeholder="e.g., Koramangala, Pune..."
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </FilterSection>
                    
                    {/* Property Type Filter (Radios) */}
                    <FilterSection title="Gender / Type">
                        {PROPERTY_TYPES.map((opt) => (
                            <div key={opt.value} className="flex items-center">
                                <input
                                    id={`type-${opt.value}`}
                                    name="propertyType"
                                    type="radio"
                                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    checked={type === opt.value}
                                    onChange={() => setType(opt.value)}
                                />
                                <label htmlFor={`type-${opt.value}`} className="ml-3 text-gray-700 text-sm cursor-pointer">
                                    {opt.label}
                                </label>
                            </div>
                        ))}
                        <div className="flex items-center">
                            <input
                                id="type-all"
                                name="propertyType"
                                type="radio"
                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                checked={type === ""}
                                onChange={() => setType("")}
                            />
                            <label htmlFor="type-all" className="ml-3 text-gray-700 font-medium text-sm cursor-pointer">
                                All Types
                            </label>
                        </div>
                    </FilterSection>
                    
                    {/* Budget Filter (Radios) */}
                    <FilterSection title="Monthly Budget (₹)">
                        {BUDGET_RANGES.map((range, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    id={`budget-${index}`}
                                    name="budgetRange"
                                    type="radio"
                                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    checked={selectedBudget?.label === range.label}
                                    onChange={() => setSelectedBudget(range)}
                                />
                                <label htmlFor={`budget-${index}`} className="ml-3 text-gray-700 text-sm cursor-pointer">
                                    {range.label}
                                </label>
                            </div>
                        ))}
                        <div className="flex items-center">
                            <input
                                id="budget-all"
                                name="budgetRange"
                                type="radio"
                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                checked={selectedBudget === null}
                                onChange={() => setSelectedBudget(null)}
                            />
                            <label htmlFor="budget-all" className="ml-3 text-gray-700 font-medium text-sm cursor-pointer">
                                All Budgets
                            </label>
                        </div>
                    </FilterSection>
                </aside>

                {/* -------------------------------------
                    ✅ PG LISTINGS (Main Content)
                ------------------------------------- */}
                <section className="flex-1 min-w-0">
                    
                    {/* Top Bar (Results Count & Sort By) */}
                    <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Showing <span className="text-indigo-600 font-bold">{sortedAndFilteredPGs.length}</span> PGs for You
                        </h1>
                        
                        {/* Sort By Dropdown */}
                        <div className="flex items-center space-x-2">
                            <label htmlFor="sortBy" className="text-gray-600 text-sm hidden sm:block">Sort By:</label>
                            <select
                                id="sortBy"
                                className="border border-gray-300 px-3 py-2 rounded-lg bg-white appearance-none cursor-pointer text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="recent">Most Recent</option>
                                <option value="low-high">Price: Low to High</option>
                                <option value="high-low">Price: High to Low</option>
                            </select>
                        </div>
                    </div>


                    {/* PG Listing Cards */}
                    {sortedAndFilteredPGs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-700 mb-3">No Results Found 😔</h2>
                            <p className="text-gray-500">Try adjusting your filters or <span className="font-semibold text-indigo-600 cursor-pointer" onClick={handleClearFilters}>clear them</span> to see all properties.</p>
                            <button 
                                onClick={handleClearFilters}
                                className="mt-5 inline-block bg-indigo-50 text-indigo-700 border border-indigo-300 px-5 py-2 rounded-lg font-medium hover:bg-indigo-100 transition"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {sortedAndFilteredPGs.map((pg) => (
                                <Link
                                    key={pg._id}
                                    to={`/services/pg/${pg._id}`}
                                    className="block border border-gray-200 bg-white rounded-xl shadow-lg transition duration-300 transform hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="relative">
                                        <img
                                            src={
                                                pg.images?.[0]
                                                    ? `http://localhost:5000${pg.images[0]}`
                                                    : "https://via.placeholder.com/400x250?text=PG+Image+Not+Available"
                                            }
                                            className="h-48 w-full object-cover"
                                            alt={pg.title}
                                        />
                                        {/* Price Badge Overlay */}
                                        <div className="absolute top-3 right-3 text-xl font-extrabold text-white bg-indigo-600 px-4 py-1 rounded-lg shadow-lg">
                                            ₹{pg.monthlyRent}
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-3">
                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{pg.title}</h3>

                                        <p className="text-gray-500 text-sm flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            {pg.location}
                                        </p>
                                        
                                        {/* Ratings & Type Tag */}
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="flex items-center text-yellow-600 font-semibold">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9.049 2.927c.3-.921 1.62-.921 1.92 0l2.365 7.284a1 1 0 00.95.691h7.668a1 1 0 01.54 1.705l-6.21 4.512a1 1 0 00-.364 1.118l2.365 7.284c.3.921-.755 1.688-1.54 1.118l-6.21-4.512a1 1 0 00-1.175 0l-6.21 4.512c-.785.57-1.84-.197-1.54-1.118l2.365-7.284a1 1 0 00-.364-1.118L2.022 13.917a1 1 0 01.54-1.705h7.668a1 1 0 00.95-.691l2.365-7.284z" />
                                                </svg>
                                                4.5 <span className="text-gray-400 font-normal ml-1">(89 Reviews)</span>
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${pg.propertyType === 'boys' ? 'bg-blue-100 text-blue-800' : pg.propertyType === 'girls' ? 'bg-pink-100 text-pink-800' : 'bg-green-100 text-green-800'}`}>
                                                {pg.propertyType || 'General'}
                                            </span>
                                        </div>
                                        
                                        {/* Amenities Row */}
                                        <div className="flex gap-4 text-sm text-gray-600 pt-3 border-t">
                                            <span className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.111A9.501 9.501 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                Chat
                                            </span>
                                            <span className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25m0 0l-3 3m3-3l3 3m-4.664-8.664a7.5 7.5 0 00-6.19-2.936C5.068 9.387 4.5 11.597 4.5 13.5a7.5 7.5 0 0015 0c0-1.903-.568-4.113-1.802-5.936a7.5 7.5 0 00-6.19-2.936z" />
                                                </svg>
                                                Wi-Fi
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
};

export default AllPGs;