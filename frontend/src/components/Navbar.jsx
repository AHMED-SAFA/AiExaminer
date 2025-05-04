// /* eslint-disable react-hooks/exhaustive-deps */
// import { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// import {
//   Bars3Icon,
//   XMarkIcon,
//   UserCircleIcon,
//   ChevronDownIcon,
//   AcademicCapIcon,
//   ChartBarIcon,
//   ArrowRightOnRectangleIcon,
// } from "@heroicons/react/24/outline";

// export default function Navbar() {
//   const { token, logout } = useAuth();
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

//   useEffect(() => {
//     fetchUserData();
//   }, [token]);

//   const fetchUserData = async () => {
//     try {
//       const response = await axios.get("http://127.0.0.1:8000/api/auth/user/", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setUserData(response.data);
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//     }
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate("/login");
//   };

//   const toggleMobileMenu = () => {
//     setIsOpen(!isOpen);
//   };

//   const toggleProfileMenu = () => {
//     setIsProfileMenuOpen(!isProfileMenuOpen);
//   };

//   return (
//     <nav className="bg-black text-white shadow-lg">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           {/* Logo and Desktop Navigation */}
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <Link to="/" className="text-white font-bold text-xl">
//                 AiExaminer
//               </Link>
//             </div>

//             {/* Desktop Navigation Links */}
//             <div className="hidden md:ml-10 md:flex md:space-x-4">
//               <Link
//                 to="/previous-exams"
//                 className="px-4 py-2 rounded-md text-white font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center"
//               >
//                 <AcademicCapIcon className="h-5 w-5 mr-1" />
//                 Previous Exams
//               </Link>

//               <Link
//                 to="/exam-statistics"
//                 className="px-4 py-2 rounded-md text-white font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center"
//               >
//                 <ChartBarIcon className="h-5 w-5 mr-1" />
//                 Statistics
//               </Link>
//             </div>
//           </div>

//           {/* Profile Menu (Desktop) */}
//           <div className="hidden md:flex md:items-center">
//             <div className="ml-3 relative">
//               <div>
//                 <button
//                   onClick={toggleProfileMenu}
//                   className="flex items-center text-white hover:text-gray-200 focus:outline-none"
//                 >
//                   {userData?.image ? (
//                     <img
//                       className="h-8 w-8 rounded-full object-cover border-2 border-white"
//                       src={userData.image}
//                       alt="Profile"
//                     />
//                   ) : (
//                     <UserCircleIcon className="h-8 w-8" />
//                   )}
//                   <ChevronDownIcon className="ml-1 h-4 w-4" />
//                 </button>
//               </div>

//               {/* Profile Dropdown */}
//               {isProfileMenuOpen && (
//                 <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
//                   <Link
//                     to="/profile"
//                     onClick={() => setIsProfileMenuOpen(false)}
//                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   >
//                     Profile
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Mobile menu button */}
//           <div className="flex md:hidden items-center">
//             <button
//               onClick={toggleMobileMenu}
//               className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 focus:outline-none"
//             >
//               {isOpen ? (
//                 <XMarkIcon className="block h-6 w-6" />
//               ) : (
//                 <Bars3Icon className="block h-6 w-6" />
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {isOpen && (
//         <div className="md:hidden bg-black text-white shadow-lg">
//           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//             <Link
//               to="/previous-exams"
//               onClick={toggleMobileMenu}
//               className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700"
//             >
//               <AcademicCapIcon className="h-5 w-5 mr-2" />
//               Previous Exams
//             </Link>

//             <Link
//               to="/exam-statistics"
//               onClick={toggleMobileMenu}
//               className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700"
//             >
//               <ChartBarIcon className="h-5 w-5 mr-2" />
//               Statistics
//             </Link>
//           </div>

//           <div className="pt-4 pb-3 border-t border-indigo-700">
//             <div className="flex items-center px-5">
//               <div className="flex-shrink-0">
//                 {userData?.image ? (
//                   <img
//                     className="h-10 w-10 rounded-full object-cover border-2 border-white"
//                     src={userData.image}
//                     alt="Profile"
//                   />
//                 ) : (
//                   <UserCircleIcon className="h-10 w-10 text-white" />
//                 )}
//               </div>
//               <div className="ml-3">
//                 <div className="text-base font-medium text-white">
//                   {userData?.username || "User"}
//                 </div>
//               </div>
//             </div>
//             <div className="mt-3 px-2 space-y-1">
//               <Link
//                 to="/profile"
//                 onClick={toggleMobileMenu}
//                 className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700"
//               >
//                 <UserCircleIcon className="h-5 w-5 mr-2" />
//                 Profile
//               </Link>
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center w-full text-left text-white px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700"
//               >
//                 <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }



/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/auth/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">
                AiExaminer
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              <Link
                to="/previous-exams"
                className="px-4 py-2 rounded-md text-white font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center"
              >
                <AcademicCapIcon className="h-5 w-5 mr-1" />
                Previous Exams
              </Link>

              <Link
                to="/exam-statistics"
                className="px-4 py-2 rounded-md text-white font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center"
              >
                <ChartBarIcon className="h-5 w-5 mr-1" />
                Statistics
              </Link>
            </div>
          </div>

          {/* Profile Menu (Desktop) */}
          <div className="hidden md:flex md:items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center text-white hover:text-gray-200 focus:outline-none"
                >
                  {userData?.image ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-white"
                      src={userData.image}
                      alt="Profile"
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8" />
                  )}
                  <ChevronDownIcon
                    className={`ml-1 h-4 w-4 transition-transform duration-300 ${
                      isProfileMenuOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
              </div>

              {/* Profile Dropdown with animation */}
              <div
                className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 transition-all duration-300 ease-in-out transform ${
                  isProfileMenuOpen
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <Link
                  to="/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button with animation */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 focus:outline-none"
            >
              <span className="relative">
                <Bars3Icon
                  className={`h-6 w-6 transition-opacity duration-300 absolute ${
                    isOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <XMarkIcon
                  className={`h-6 w-6 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with slide down animation */}
      <div
        className={`md:hidden bg-black text-white shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/previous-exams"
            onClick={toggleMobileMenu}
            className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-all duration-200"
          >
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Previous Exams
          </Link>

          <Link
            to="/exam-statistics"
            onClick={toggleMobileMenu}
            className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-all duration-200"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Statistics
          </Link>
        </div>

        <div className="pt-4 pb-3 border-t border-indigo-700">
          <div className="flex items-center px-5">
            <div className="flex-shrink-0">
              {userData?.image ? (
                <img
                  className="h-10 w-10 rounded-full object-cover border-2 border-white"
                  src={userData.image}
                  alt="Profile"
                />
              ) : (
                <UserCircleIcon className="h-10 w-10 text-white" />
              )}
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-white">
                {userData?.username || "User"}
              </div>
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1">
            <Link
              to="/profile"
              onClick={toggleMobileMenu}
              className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-all duration-200"
            >
              <UserCircleIcon className="h-5 w-5 mr-2" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left text-white px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

