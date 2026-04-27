import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-700 rounded-lg transition"
          title="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <h2 className="text-xl font-semibold text-white">Collaborink</h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="p-2 hover:bg-gray-700 rounded-lg transition relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 hover:bg-gray-700 rounded-lg transition">
          <Settings size={20} />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <span className="text-sm font-medium">{user?.firstName}</span>
            <ChevronDown size={16} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-gray-700">
                <p className="text-sm font-medium">{user?.email}</p>
              </div>

              <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition flex items-center gap-2">
                <User size={16} /> Profile
              </button>

              <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition flex items-center gap-2">
                <Settings size={16} /> Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 transition flex items-center gap-2 text-red-400 hover:text-red-300"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}