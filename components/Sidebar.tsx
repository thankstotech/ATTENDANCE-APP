import React from 'react';
import { Home, Zap, Database, X, FileSpreadsheet } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'HOME' | 'QUICK_ADD' | 'REPORTS' | 'BACKUP') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate }) => {
  const handleNav = (view: 'HOME' | 'QUICK_ADD' | 'REPORTS' | 'BACKUP') => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
          <h2 className="text-xl font-bold tracking-tight">SiteLog Pro</h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
           <button 
            onClick={() => handleNav('HOME')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
               <Home size={20} />
            </div>
            <span className="font-medium text-gray-700">Home / Calendars</span>
          </button>

          <button 
            onClick={() => handleNav('QUICK_ADD')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className="bg-orange-100 p-2 rounded-full text-orange-600">
              <Zap size={20} />
            </div>
            <span className="font-medium text-gray-700">Quick Attendance</span>
          </button>

          <button 
            onClick={() => handleNav('BACKUP')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
             <div className="bg-green-100 p-2 rounded-full text-green-600">
              <Database size={20} />
            </div>
            <span className="font-medium text-gray-700">Backup & Restore</span>
          </button>

          <button 
            onClick={() => handleNav('REPORTS')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
              <FileSpreadsheet size={20} />
            </div>
            <span className="font-medium text-gray-700">Reports (PDF/Excel)</span>
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 text-center text-xs text-gray-400">
          v1.0.1 &bull; Local Storage
        </div>
      </div>
    </>
  );
};