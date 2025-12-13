import React, { useEffect } from "react";
import {
  FaHome,
  FaUsers,
  FaMapMarkedAlt,
  FaHandshake,
  FaLightbulb,
  FaShieldAlt,
} from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Header />

      {/* HERO */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          About Zip Nivasa
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
          Zip Nivasa helps you find, manage, and live comfortably — whether
          you are a tenant, PG owner, mess provider, or service partner.
        </p>
      </section>

      {/* STORY */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Why Zip Nivasa Was Created
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Finding a good PG, mess, or nearby services is often confusing,
              time-consuming, and unreliable. Zip Nivasa was created to solve
              this exact problem.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We bring everything together on one platform — verified listings,
              clear pricing, easy communication, and smart location-based
              discovery — so you can focus on living, not searching.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <ul className="space-y-5">
              <li className="flex items-center gap-4">
                <FaHome className="text-emerald-600 text-2xl" />
                <span className="text-slate-700">
                  PGs, Messes & Services in one place
                </span>
              </li>
              <li className="flex items-center gap-4">
                <FaMapMarkedAlt className="text-emerald-600 text-2xl" />
                <span className="text-slate-700">
                  Location-based nearby discovery
                </span>
              </li>
              <li className="flex items-center gap-4">
                <FaUsers className="text-emerald-600 text-2xl" />
                <span className="text-slate-700">
                  Designed for tenants & owners
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-10">
            What Zip Nivasa Offers
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaHome />,
                title: "Smart Accommodation Search",
                desc: "Find PGs and rentals based on location, budget, and preferences.",
              },
              {
                icon: <FaUsers />,
                title: "Easy Owner Management",
                desc: "Owners can manage listings, specials, and users easily.",
              },
              {
                icon: <FaMapMarkedAlt />,
                title: "Nearby Services",
                desc: "Discover mess, laundry, and essentials around you.",
              },
              {
                icon: <FaShieldAlt />,
                title: "Secure & Verified",
                desc: "Secure login and trusted platform experience.",
              },
              {
                icon: <FaLightbulb />,
                title: "Simple & User Friendly",
                desc: "Clean design that anyone can use without confusion.",
              },
              {
                icon: <FaHandshake />,
                title: "Built on Trust",
                desc: "Transparency between tenants and service providers.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-slate-50 p-8 rounded-3xl shadow-md hover:shadow-xl transition"
              >
                <div className="text-emerald-600 text-4xl mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR (NEW SECTION) */}
      <section className="max-w-6xl mx-auto py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">
          Who Can Use Zip Nivasa?
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Students", desc: "Affordable and safe PGs near colleges." },
            { title: "Professionals", desc: "Comfortable stays near offices." },
            { title: "PG Owners", desc: "Manage listings and reach tenants." },
            { title: "Service Providers", desc: "Offer mess & laundry services." },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-lg font-semibold text-emerald-600 mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="py-16 px-6 bg-slate-50 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-10">
          Behind Zip Nivasa
        </h2>

        <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition">
          <img
            src="https://via.placeholder.com/200"
            alt="Pratik Ghule"
            className="w-32 h-32 rounded-full mx-auto mb-4 shadow-md"
          />
          <h3 className="text-xl font-semibold text-slate-800">
            Pratik Ghule
          </h3>
          <p className="text-slate-500 mt-1">
            Full Stack Developer & Creator of Zip Nivasa
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Your Stay. Your Way.
        </h2>
        <p className="max-w-2xl mx-auto mb-6 opacity-90">
          Zip Nivasa is built to make everyday living easier — from finding a
          place to managing services seamlessly.
        </p>
        <button className="bg-white text-emerald-600 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-slate-100 transition">
          Get Started with Zip Nivasa
        </button>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
