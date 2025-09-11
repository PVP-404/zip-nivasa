// src/pages/dashboard/MessOwnerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

// Dummy data to simulate API responses
const mockSubscribers = [
  { id: "s1", name: "Anil Kumar", plan: "Lunch & Dinner", status: "Active", joined: "2024-05-10" },
  { id: "s2", name: "Priya Sharma", plan: "Breakfast & Lunch", status: "Active", joined: "2024-06-01" },
  { id: "s3", name: "Rahul Singh", plan: "Dinner Only", status: "Active", joined: "2024-06-15" },
  { id: "s4", name: "Sonia Patel", plan: "All Meals", status: "Active", joined: "2024-07-20" },
];

const mockMenu = {
  monday: { lunch: "Dal, Roti, Rice, Veg Curry", dinner: "Paneer Butter Masala, Roti, Salad" },
  tuesday: { lunch: "Rajma Chawal, Curd", dinner: "Mix Veg, Roti, Dal" },
  wednesday: { lunch: "Chole Bhature", dinner: "Aloo Gobi, Roti, Jeera Rice" },
  thursday: { lunch: "Veg Biryani, Raita", dinner: "Kadhi Pakora, Rice" },
  friday: { lunch: "Palak Paneer, Roti", dinner: "Masoor Dal, Roti, Rice" },
  saturday: { lunch: "Puri Bhaji", dinner: "Pav Bhaji" },
  sunday: { lunch: "Special Thali", dinner: "Khichdi, Papad, Pickle" },
};

const mockInquiries = [
  { 
    id: "i1", 
    customerName: "Siddharth Jain", 
    contact: "9876543210", 
    status: "New",
    date: "2024-08-15T10:30:00",
    message: "I am looking for a lunch subscription near Hinjewadi. Do you deliver to my area?",
  },
  { 
    id: "i2", 
    customerName: "Shreya Gupta", 
    contact: "9988776655", 
    status: "Contacted",
    date: "2024-08-14T16:45:00",
    message: "Hi, what are your meal plan options for a single person?",
  },
];

const mockReviews = [
  { id: "r1", customer: "Aarti", rating: 5, comment: "Excellent food quality and on-time delivery!", date: "2024-09-01" },
  { id: "r2", customer: "Vivek", rating: 4, comment: "The lunch menu is great, but dinner could have more variety.", date: "2024-08-28" },
  { id: "r3", customer: "Komal", rating: 5, comment: "Very hygienic and affordable. A lifesaver for students.", date: "2024-08-25" },
  { id: "r4", customer: "Deepak", rating: 3, comment: "Sometimes the food is a bit too spicy.", date: "2024-08-20" },
];

const MessOwnerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [menu, setMenu] = useState({});
  const [activeTab, setActiveTab] = useState("subscribers");

  const [todaysMenu, setTodaysMenu] = useState({
    lunch: "",
    dinner: "",
  });

  const user = {
    id: "mess123",
    role: "mess_owner",
    name: "Maharaja Mess Services",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSubscribers(mockSubscribers);
        setInquiries(mockInquiries);
        setReviews(mockReviews);
        setMenu(mockMenu);
        const currentDay = getDayName(new Date().getDay()).toLowerCase();
        setTodaysMenu({
          lunch: mockMenu[currentDay]?.lunch || "",
          dinner: mockMenu[currentDay]?.dinner || "",
        });
      } catch (err) {
        setError("Failed to fetch dashboard data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleMarkInquiry = (inquiryId, newStatus) => {
    setInquiries(inquiries.map(inquiry => 
      inquiry.id === inquiryId ? {...inquiry, status: newStatus} : inquiry
    ));
  };

  const handleViewInquiry = (inquiry) => {
    alert(`Inquiry Details:\nFrom: ${inquiry.customerName}\nContact: ${inquiry.contact}\nMessage: ${inquiry.message}`);
  };

  const handleMenuUpdate = (e) => {
    e.preventDefault();
    const today = getDayName(new Date().getDay()).toLowerCase();
    // In a real app, you'd send this to an API
    console.log(`Updating today's menu for ${today}:`, todaysMenu);
    setMenu(prevMenu => ({
      ...prevMenu,
      [today]: todaysMenu
    }));
    alert("Today's menu has been updated successfully!");
  };

  const getDayName = (dayIndex) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayIndex];
  };

  const getStarRating = (rating) => {
    const filledStars = "⭐".repeat(rating);
    const emptyStars = "☆".repeat(5 - rating);
    return (
      <span className="text-yellow-400">
        {filledStars}
        <span className="text-gray-300">{emptyStars}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header userRole={user.role} isLoggedIn={true} />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white p-6 rounded-lg shadow-md h-32"></div>
                ))}
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="bg-white p-6 rounded-lg shadow-sm h-80"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header userRole={user.role} isLoggedIn={true} />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <div className="text-xl text-red-500 mb-4">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const newInquiriesCount = inquiries.filter(i => i.status === "New").length;
  const currentDay = getDayName(new Date().getDay()).toLowerCase();

  const renderContent = () => {
    switch (activeTab) {
      case "subscribers":
        return (
          <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">My Subscribers</h2>
            </div>
            {subscribers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>You have no active subscribers yet. Start marketing your mess to attract customers!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subscriber.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.plan}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.joined}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {subscriber.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case "menu":
        return (
          <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Weekly Menu</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(menu).map(([day, meals]) => (
                <div key={day} className={`p-4 rounded-lg border ${day === currentDay ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                  <h3 className="text-lg font-bold capitalize mb-2">{day} {day === currentDay && <span className="text-xs font-normal text-blue-600">(Today)</span>}</h3>
                  <div className="flex flex-col md:flex-row md:justify-between text-sm">
                    <p className="mb-2 md:mb-0">
                      <span className="font-semibold text-gray-700">Lunch:</span> {meals.lunch}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Dinner:</span> {meals.dinner}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "inquiries":
        return (
          <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Inquiries & Leads</h2>
            {inquiries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No new inquiries at the moment. Keep your profile updated to attract more customers.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div 
                    key={inquiry.id} 
                    className={`p-4 rounded-lg border transition-colors ${
                      inquiry.status === "New" ? "bg-purple-50 border-purple-200 hover:bg-purple-100" : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{inquiry.customerName}</h3>
                        <p className="text-sm text-gray-500 mt-1">{inquiry.message}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          inquiry.status === "New" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                        }`}>
                          {inquiry.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(inquiry.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end items-center mt-4 pt-3 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewInquiry(inquiry)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                        {inquiry.status === "New" && (
                          <button
                            onClick={() => handleMarkInquiry(inquiry.id, "Contacted")}
                            className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                          >
                            Mark as Contacted
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "feedback":
        return (
          <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Feedback & Reviews</h2>
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No reviews yet. Keep up the good work and they will come!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-gray-900">{review.customer}</div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                    <div className="flex items-center mb-2">
                      {getStarRating(review.rating)}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "todays_menu":
        return (
          <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Today's Menu</h2>
            <form onSubmit={handleMenuUpdate} className="space-y-4">
              <div>
                <label htmlFor="lunch" className="block text-sm font-medium text-gray-700 mb-1">Lunch Menu</label>
                <input
                  type="text"
                  id="lunch"
                  name="lunch"
                  value={todaysMenu.lunch}
                  onChange={(e) => setTodaysMenu({...todaysMenu, lunch: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Dal Makhani, Rice, Roti"
                  required
                />
              </div>
              <div>
                <label htmlFor="dinner" className="block text-sm font-medium text-gray-700 mb-1">Dinner Menu</label>
                <input
                  type="text"
                  id="dinner"
                  name="dinner"
                  value={todaysMenu.dinner}
                  onChange={(e) => setTodaysMenu({...todaysMenu, dinner: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Paneer Tikka Masala, Roti, Salad"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Menu
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header userRole={user.role} isLoggedIn={true} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
              Welcome, {user.name}! 👋
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/add-mess"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Mess
              </Link>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Subscribers</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-1">{subscribers.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2h2m13-2h-2.5A2.5 2.5 0 0112 17.5V15m12.5-3.5h-2.5a2.5 2.5 0 00-2.5 2.5v2.5m-10-2h-2.5A2.5 2.5 0 0012 17.5V15m-12-2h-2.5a2.5 2.5 0 00-2.5 2.5v2.5" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Manage your current subscribers.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">New Inquiries</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-1">
                    {newInquiriesCount}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Leads that need your attention.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Average Rating</h3>
                  <div className="flex items-center text-4xl font-bold text-gray-900 mt-1">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) || "N/A"}
                    <span className="text-yellow-400 text-3xl ml-2">⭐</span>
                  </div>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.977 2.887a1 1 0 00-.363 1.118l1.519 4.674c.3.921-.755 1.688-1.539 1.118l-3.977-2.887a1 1 0 00-1.176 0l-3.977 2.887c-.784.57-1.838-.197-1.539-1.118l1.519-4.674a1 1 0 00-.364-1.118L2.92 10.1c-.783-.57-.381-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Based on {reviews.length} reviews.</p>
            </div>
          </section>

          <div className="border-b border-gray-200 mb-6">
            <nav className="flex flex-wrap space-x-4 sm:space-x-8">
              <button
                onClick={() => setActiveTab("subscribers")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "subscribers" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Subscribers
              </button>
              <button
                onClick={() => setActiveTab("menu")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "menu" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Weekly Menu
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "inquiries" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Inquiries
                {newInquiriesCount > 0 && (
                  <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {newInquiriesCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "feedback" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Feedback & Reviews
              </button>
              <button
                onClick={() => setActiveTab("todays_menu")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "todays_menu" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Update Today's Menu
              </button>
            </nav>
          </div>
          
          {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MessOwnerDashboard;