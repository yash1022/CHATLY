 import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth} from '../CONTEXT/AuthProvider';

export default function Navbar() {
  const navigate = useNavigate();

 
  const {user , logout} = useAuth();
  const isLoggedIn = user ? true : false;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } 

  };






  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 group"
        >
          <span className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
            C
          </span>
          <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chatly
          </span>
        </button>

        <div className="flex items-center gap-4">
          {
            isLoggedIn ? (



          <button
            type="button"
            onClick={() => handleLogout()}
            className="px-5 py-2 text-slate-700 font-medium rounded-full hover:text-blue-600 transition-colors"
          >
            Logout
          </button>

          
          
        ):(
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-slate-700 font-medium rounded-full hover:text-blue-600 transition-colors"
          >
            Login
          </button>
           
          )
          }

          {
            isLoggedIn ? null : (
              <button
            type="button"
            onClick={() => navigate('/signup')}
            className="px-6 py-2 rounded-full text-white font-semibold bg-linear-to-r from-blue-500 to-purple-500 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Sign Up
          </button>)

          }


         {
          isLoggedIn ? (
            <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-md hover:scale-105 transition-transform"
            aria-label="Profile"
          >
            <img
              src="https://ui-avatars.com/api/?name=User&background=random&size=128"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
          ):null
         }
          
          


          
        </div>
      </div>
    </header>
  );
}
