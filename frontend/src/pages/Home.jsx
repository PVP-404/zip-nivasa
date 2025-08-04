import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const services = [
  { title: 'PG/Flats', desc: 'Explore and rent paying guest accommodations and flats.', icon: '🏠' },
  { title: 'Mess', desc: 'Get access to affordable and hygienic mess facilities.', icon: '🍽️' },
  { title: 'Laundry', desc: 'Simplify your laundry needs with convenient services.', icon: '🧺' },
  { title: 'Other Facilities', desc: 'Discover additional services such as housekeeping.', icon: '🧹' },
];

const fadeIn = (direction = "up", delay = 0) => ({
  hidden: { opacity: 0, y: direction === "up" ? 40 : 0 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: "easeOut"
    }
  }
});

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-700 scroll-smooth">
      <Header />

      <motion.header
        className="text-center py-16 px-4 bg-gradient-to-r from-teal-50 to-indigo-50"
        initial="hidden"
        animate="show"
        variants={fadeIn("up", 0)}
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-teal-800">
          One Platform, All Essentials.
        </h2>
        <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
          Find PGs, Mess, Laundry, and more — tailored for students and migrants in new cities.
        </p>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="#services"
          className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-700 transition"
        >
          Get Started
        </motion.a>
      </motion.header>

      <section id="services" className="bg-white py-16 px-4">
        <motion.h3
          className="text-3xl font-bold text-center mb-12 text-indigo-600"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeIn("up", 0.1)}
        >
          Our Services
        </motion.h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-xl transition duration-300 hover:-translate-y-1 group border border-gray-200"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeIn("up", 0.1 + index * 0.2)}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition">{service.icon}</div>
              <h4 className="text-xl font-semibold mb-2 text-teal-700">{service.title}</h4>
              <p className="text-gray-600">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
