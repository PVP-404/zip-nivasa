// import React from 'react';
// import { useLocation, Link } from 'react-router-dom';
// import { motion } from 'framer-motion';

// const roleImages = {
//   student: 'https://images.pexels.com/photos/3807750/pexels-photo-3807750.jpeg',
//   pgowner: 'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg',
//   laundry: 'https://images.pexels.com/photos/3616760/pexels-photo-3616760.jpeg',
//   service: 'https://images.pexels.com/photos/6209271/pexels-photo-6209271.jpeg',
// };

// const Login = () => {
//   const query = new URLSearchParams(useLocation().search);
//   const role = query.get("role") || "user";
//   const roleName = role.charAt(0).toUpperCase() + role.slice(1);

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50">
//       {/* Left side with image */}
//       <div className="hidden md:block md:w-1/2 h-screen relative">
//         <img
//           src={roleImages[role] || roleImages['student']}
//           alt="User Login"
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-indigo-900 bg-opacity-40 flex items-center justify-center">
//           <h1 className="text-white text-4xl font-extrabold text-center px-4">
//             Welcome, <br /> Login to your {roleName} account.
//           </h1>
//         </div>
//       </div>

//       {/* Right side with login form */}
//       <motion.div
//         className="w-full md:w-1/2 flex items-center justify-center p-8"
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.6 }}
//       >
//         <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
//           <h2 className="text-4xl font-bold text-gray-800 text-center mb-2">
//             Login
//           </h2>
//           <p className="text-gray-500 text-center mb-8">
//             Please enter your details to continue.
//           </p>

//           <form className="space-y-6">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
//               <input
//                 type="email"
//                 id="email"
//                 placeholder="you@example.com"
//                 className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
//               <input
//                 type="password"
//                 id="password"
//                 placeholder="********"
//                 className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <input
//                   id="remember-me"
//                   name="remember-me"
//                   type="checkbox"
//                   className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
//               </div>
//               <div className="text-sm">
//                 <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
//                   Forgot your password?
//                 </a>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
//             >
//               Login
//             </button>
//           </form>

//           <p className="text-center text-gray-500 mt-8">
//             New to Zip-Nivasa?{' '}
//             <Link to={`/register?role=${role}`} className="text-indigo-600 font-semibold hover:underline">
//               Create an account
//             </Link>
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const roleImages = {
  student: 'https://images.pexels.com/photos/3807750/pexels-photo-3807750.jpeg',
  pgowner: 'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg',
  laundry: 'https://images.pexels.com/photos/3616760/pexels-photo-3616760.jpeg',
  service: 'https://images.pexels.com/photos/6209271/pexels-photo-6209271.jpeg',
};

const Login = () => {
  const query = new URLSearchParams(useLocation().search);
  const role = query.get("role") || "student";
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulated login based on role
    switch (role) {
      case 'student':
        navigate('/dashboard/student');
        break;
      case 'pgowner':
        navigate('/dashboard/pgowner');
        break;
      case 'laundry':
        navigate('/dashboard/laundry');
        break;
      case 'service':
        navigate('/dashboard/service');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50">
      {/* Left Image Section */}
      <div className="hidden md:block md:w-1/2 h-screen relative">
        <img
          src={roleImages[role] || roleImages['student']}
          alt="User Login"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900 bg-opacity-40 flex items-center justify-center">
          <h1 className="text-white text-4xl font-extrabold text-center px-4">
            Welcome, <br /> Login to your {roleName} account.
          </h1>
        </div>
      </div>

      {/* Right Login Form Section */}
      <motion.div
        className="w-full md:w-1/2 flex items-center justify-center p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-2">Login</h2>
          <p className="text-gray-500 text-center mb-8">
            Please enter your details to continue.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                placeholder="********"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-indigo-600 hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
            >
              Login
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8">
            New to Zip-Nivasa?{' '}
            <Link to={`/register?role=${role}`} className="text-indigo-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
