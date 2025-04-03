
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HeartPulse, 
  MessageCircle, 
  Users, 
  BookOpen, 
  Wind, 
  Settings
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: <HeartPulse className="h-5 w-5" /> },
  { path: '/chat', label: 'Chat Support', icon: <MessageCircle className="h-5 w-5" /> },
  { path: '/forum', label: 'Forums', icon: <Users className="h-5 w-5" /> },
  { path: '/journal', label: 'Journal', icon: <BookOpen className="h-5 w-5" /> },
  { path: '/breathing', label: 'Breathing', icon: <Wind className="h-5 w-5" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white dark:bg-charcoal shadow-md transition-all duration-300 z-20 pt-16 ${
        isOpen ? 'w-64' : 'w-0 -translate-x-full md:translate-x-0 md:w-16'
      }`}
    >
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 py-3 px-3 rounded-lg transition-all
              ${isActive 
                ? 'bg-sage text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-sage/10'}
              ${!isOpen && 'justify-center'}
            `}
          >
            {item.icon}
            {isOpen && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
