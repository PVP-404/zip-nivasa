
import React from "react";
// Import icons for Mission, Vision, and Values
import { FaBullseye, FaLightbulb, FaHandshake } from "react-icons/fa";
// Import shared components
import Header from "../components/Header";
import Footer from "../components/Footer";
const AboutUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      {/* Global Header */}
      <Header />
      {/* Hero Section */}
      <header className="bg-blue-900 text-white text-center py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fadeInDown">
            Your Trusted Partner in Accommodation Management
          </h1>
          <p className="text-xl md:text-2xl font-light mb-6 animate-fadeInUp">
            Simplifying property management, one solution at a time.
          </p>
          <a
            href="#our-story"
            className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105"
          >
            Learn Our Story
          </a>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto py-16 px-4 md:px-8">
        {/* Our Story Section */}
        <section id="our-story" className="mb-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold text-blue-950 mb-4">
                Born from a Simple Idea
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Zip Nivasa was founded by a team who experienced the complexities
                of PG and rental management firsthand. We saw a need for a simpler,
                more transparent system that could benefit both property owners and
                tenants. Our platform is built on the belief that technology can
                make life easier, and we're committed to making that a reality for
                the accommodation sector.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                From a small idea to a comprehensive solution, our journey is all
                about solving real-world problems with innovative and user-friendly
                tools.
              </p>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://via.placeholder.com/600x400.png?text=Our+Story+Image"
                alt="A group of people working together"
                className="rounded-xl shadow-2xl transform hover:rotate-2 transition duration-500"
              />
            </div>
          </div>
        </section>
        {/* Mission, Vision & Values Section */}
        <section className="text-center mb-20">
          <h2 className="text-4xl font-bold text-blue-950 mb-2">
            Our Core Principles
          </h2>
          <p className="text-gray-600 text-lg mb-10">
            The foundation of everything we do.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-200 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300">
              <FaBullseye className="text-blue-500 text-5xl mb-4" />
              <h3 className="text-2xl font-bold text-blue-950 mb-2">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To simplify PG and rental management, making it transparent and
                hassle-free for all stakeholders through technology-driven
                services.
              </p>
            </div>
            <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-200 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300">
              <FaLightbulb className="text-blue-500 text-5xl mb-4" />
              <h3 className="text-2xl font-bold text-blue-950 mb-2">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To be the most trusted digital partner in India's accommodation
                sector, empowering owners and tenants with innovation and
                convenience.
              </p>
            </div>
            <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-200 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300">
              <FaHandshake className="text-blue-500 text-5xl mb-4" />
              <h3 className="text-2xl font-bold text-blue-950 mb-2">
                Our Values
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We are committed to integrity, transparency, and innovation. We
                build our platform and our relationships on a foundation of trust.
              </p>
            </div>
          </div>
        </section>
        {/* Team Section */}
        <section className="text-center mb-20">
          <h2 className="text-4xl font-bold text-blue-950 mb-2">Meet Our Team</h2>
          <p className="text-gray-600 text-lg mb-10">
            The minds and passion behind Zip Nivasa.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-white shadow-lg rounded-3xl p-8 text-center transition-all duration-300 transform hover:shadow-2xl hover:scale-105">
              <img
                src="https://via.placeholder.com/200"
                alt="Pratik Ghule"
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
              />
              <h3 className="text-xl font-semibold text-blue-950">
                Pratik Ghule
              </h3>
              <p className="text-gray-500">Backend Developer</p>
            </div>
            <div className="bg-white shadow-lg rounded-3xl p-8 text-center transition-all duration-300 transform hover:shadow-2xl hover:scale-105">
              <img
                src="https://via.placeholder.com/200"
                alt="Vivek Ugale"
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
              />
              <h3 className="text-xl font-semibold text-blue-950">
                Vivek Ugale
              </h3>
              <p className="text-gray-500">Front End Developer</p>
            </div>
            <div className="bg-white shadow-lg rounded-3xl p-8 text-center transition-all duration-300 transform hover:shadow-2xl hover:scale-105">
              <img
                src="https://via.placeholder.com/200"
                alt="Pratik Warikari"
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
              />
              <h3 className="text-xl font-semibold text-blue-950">
                Pratik Warikari
              </h3>
              <p className="text-gray-500">UI/UX Designer</p>
            </div>
          </div>
        </section>
        {/* Call to Action Section */}
        <section className="bg-blue-500 text-white rounded-3xl p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to simplify your management?
          </h2>
          <p className="text-lg mb-6">
            Join thousands of happy owners and tenants on Zip Nivasa.
          </p>
          <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105">
            Get Started
          </button>
        </section>
      </main>
      {/* Global Footer */}
      <Footer />
    </div>
  );
};
export default AboutUs;
