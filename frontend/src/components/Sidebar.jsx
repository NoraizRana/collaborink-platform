import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MessageSquare,
  Calendar,
  FileText,
  Settings,
  Plus,
} from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { workspaces, currentWorkspace } = useWorkspaceStore();

  const menuItems = [
    {
      icon: Briefcase,
      label: 'Projects',
      path: '/projects',
    },
    {
      icon: MessageSquare,
      label: 'Chat',
      path: '/chat',
    },
    {
      icon: Calendar,
      label: 'Calendar',
      path: '/calendar',
    },
    {
      icon: FileText,
      label: 'Files',
      path: '/files',
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
    },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {isOpen && <h1 className="text-xl font-bold text-blue-400">COLLABORINK</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-700 rounded-lg transition"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Workspace Info */}
      {isOpen && currentWorkspace && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-1">
            {currentWorkspace.name}
          </h3>
          <p className="text-xs text-gray-500">
            {currentWorkspace.members?.length} members
          </p>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Create Button */}
      {isOpen && (
        <div className="p-4 border-t border-gray-700">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium">
            <Plus size={18} /> New Project
          </button>
        </div>
      )}
    </aside>
  );
}