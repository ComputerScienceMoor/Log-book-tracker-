import React from 'react';
import { BookOpen, LogOut, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">LogBook Trackr</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div 
                className="text-right hidden sm:block cursor-pointer hover:opacity-70 transition-all"
                onClick={() => navigate('/profile')}
              >
                <p className="text-sm font-bold text-gray-900">{user.username}</p>
                <div className="flex items-center gap-1 justify-end">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-black text-blue-600 uppercase">{user.role}</span>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-100 mx-1"></div>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="My Profile"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
