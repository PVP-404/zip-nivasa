import React from "react";

const AboutUs = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-950 mb-4">
            About Zip Nivasa
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Zip Nivasa is a smart accommodation platform that simplifies PG and rental
            management for owners and residents. We provide dashboards, booking
            management, and a seamless digital experience.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-blue-950 flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-500 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To make PG and rental accommodation management easier, transparent, and
              hassle-free for both owners and tenants through technology-driven
              dashboards and services.
            </p>
          </div>
          <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-blue-950 flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-500 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 0110 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0112 2z" />
                <path d="M16.2 7.8l-7.2 7.2-2.4-2.4" />
              </svg>
              Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To become the most trusted digital partner for accommodation solutions
              in India, empowering both owners and tenants with innovation and
              convenience.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-950">Meet Our Team</h2>
          <p className="text-gray-600 text-lg">The minds behind Zip Nivasa</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="bg-white shadow-lg rounded-3xl p-8 text-center transition-all duration-300 transform hover:shadow-2xl hover:scale-105">
            <img
              src="https://via.placeholder.com/200"
              alt="Pratik Ghule"
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
            />
            <h3 className="text-xl font-semibold text-blue-950">Pratik Ghule</h3>
            <p className="text-gray-500">Frontend Developer</p>
          </div>
          <div className="bg-white shadow-lg rounded-3xl p-8 text-center transition-all duration-300 transform hover:shadow-2xl hover:scale-105">
            <img
              src="https://via.placeholder.com/200"
              alt="Vivek Ugale"
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
            />
            <h3 className="text-xl font-semibold text-blue-950">Vivek Ugale</h3>
            <p className="text-gray-500">Backend Developer</p>
          </div>
          <div className="bg-white shadow-lg rounded-3xl p-8 text-center transition-all duration-300 transform hover:shadow-2xl hover:scale-105">
            <img
              src="https://via.placeholder.com/200"
              alt="Pratik Warikari"
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
            />
            <h3 className="text-xl font-semibold text-blue-950">Pratik Warikari</h3>
            <p className="text-gray-500">Designer / Support</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-gray-500">
          <p className="text-sm">
            © {new Date().getFullYear()} Zip Nivasa. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;