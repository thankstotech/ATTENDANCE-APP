import React, { useState, useEffect } from 'react';
import { Menu, Plus, Upload, Share2, FileDown, Trash2, Users, Briefcase, ChevronRight, Home, FileSpreadsheet, Table } from 'lucide-react';
import { AppData, AttendanceEntry, CalendarConfig } from './types';
import { loadData, saveData, exportDataToJSON, importDataFromJSON } from './services/storageService';
import { generatePDFReport, generateExcelReport, generateGoogleSheetsCSV } from './services/reportService';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';

const App = () => {
  // State
  const [data, setData] = useState<AppData>(loadData());
  const [activeCalendarId, setActiveCalendarId] = useState<string>('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modals
  const [showAddCalendar, setShowAddCalendar] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // View Routing
  const [currentView, setCurrentView] = useState<'HOME' | 'CALENDAR' | 'QUICK_ADD' | 'REPORTS' | 'BACKUP'>('HOME');

  // Persist Data effect
  useEffect(() => {
    saveData(data);
  }, [data]);

  const activeCalendar = data.calendars.find(c => c.id === activeCalendarId) || data.calendars[0];

  // --- Handlers ---

  const handleCreateCalendar = (name: string, type: 'TEAM' | 'SUB_CONTRACTOR') => {
    const newCal: CalendarConfig = {
      id: `cal-${Date.now()}`,
      name: name || 'New Calendar',
      type,
      created: Date.now()
    };
    setData(prev => ({ ...prev, calendars: [...prev.calendars, newCal] }));
    setActiveCalendarId(newCal.id);
    setShowAddCalendar(false);
    setCurrentView('HOME'); 
  };

  const handleEntrySave = (siteName: string, otHours: string, isAbsent: boolean) => {
    if (!selectedDate || !activeCalendar) return;

    const key = `${activeCalendar.id}_${selectedDate}`;
    
    // Create updated entry
    const newEntry: AttendanceEntry = {
      id: Date.now().toString(),
      calendarId: activeCalendar.id,
      date: selectedDate,
      siteName: isAbsent ? '' : siteName,
      otHours: isAbsent ? '' : otHours,
      isAbsent: isAbsent,
      timestamp: Date.now()
    };

    setData(prev => ({
      ...prev,
      entries: { ...prev.entries, [key]: newEntry }
    }));
    setShowEntryModal(false);
  };

  const handleDeleteEntry = () => {
    if (!selectedDate || !activeCalendar) return;
    const key = `${activeCalendar.id}_${selectedDate}`;
    const newEntries = { ...data.entries };
    delete newEntries[key];
    setData(prev => ({ ...prev, entries: newEntries }));
    setShowEntryModal(false);
  };

  // --- Views ---

  const renderHome = () => (
    <div className="p-4 pt-6 space-y-4 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">My Calendars</h2>
      {data.calendars.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
           <div className="inline-block p-4 bg-blue-50 rounded-full mb-3 text-blue-500">
             <Plus size={32} />
           </div>
           <p className="text-gray-500 font-medium">No calendars yet.</p>
           <p className="text-gray-400 text-sm mt-1">Tap the + button to create one.</p>
         </div>
      ) : (
        data.calendars.map(cal => (
          <button
            key={cal.id}
            onClick={() => {
              setActiveCalendarId(cal.id);
              setCurrentView('CALENDAR');
            }}
            className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between active:scale-[0.98] transition-all hover:border-blue-300"
          >
            <div className="flex items-center space-x-4">
               <div className={`p-3 rounded-full ${cal.type === 'TEAM' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                 {cal.type === 'TEAM' ? <Users size={24} /> : <Briefcase size={24} />}
               </div>
               <div className="text-left">
                 <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{cal.name}</h3>
                 <span className={`text-xs font-medium px-2 py-0.5 rounded ${cal.type === 'TEAM' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                   {cal.type === 'TEAM' ? 'Team Attendance' : 'Sub-Contractors'}
                 </span>
               </div>
            </div>
            <ChevronRight className="text-gray-400" />
          </button>
        ))
      )}
    </div>
  );

  const renderAddCalendarModal = () => {
    if (!showAddCalendar) return null;
    let name = "";
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
          <h3 className="text-xl font-bold mb-4">Add New Calendar</h3>
          <input 
            type="text" 
            placeholder="Calendar Name" 
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => name = e.target.value}
          />
          <div className="flex gap-2">
            <button 
              onClick={() => handleCreateCalendar(name, 'TEAM')}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold active:scale-95 transition-transform"
            >
              Team
            </button>
             <button 
              onClick={() => handleCreateCalendar(name, 'SUB_CONTRACTOR')}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold active:scale-95 transition-transform"
            >
              Sub-Con
            </button>
          </div>
          <button 
            onClick={() => setShowAddCalendar(false)}
            className="w-full mt-3 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderEntryModal = () => {
    if (!showEntryModal || !selectedDate) return null;
    
    const key = `${activeCalendar.id}_${selectedDate}`;
    const existing = data.entries[key];
    
    // Internal state for the modal fields
    let siteName = existing?.siteName || "";
    let otHours = existing?.otHours || "";

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        {/* Compact Modal */}
        <div className="bg-white w-[85%] max-w-[260px] rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in duration-200">
          
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              {new Date(selectedDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
            </h3>
            {existing && (
               <button onClick={handleDeleteEntry} className="text-gray-400 hover:text-red-500">
                 <Trash2 size={16} />
               </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Site Name Input */}
            <input 
              type="text" 
              defaultValue={siteName}
              placeholder="Site Name" 
              autoFocus
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 text-gray-800"
              onChange={(e) => siteName = e.target.value}
            />

            {/* OT Input */}
            <input 
              type="text" 
              defaultValue={otHours}
              placeholder="OT Hours (optional)" 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400 text-gray-800"
              onChange={(e) => otHours = e.target.value}
            />

            <div className="flex gap-2 pt-1">
              {/* Absent Button */}
              <button 
                  onClick={() => handleEntrySave('', '', true)}
                  className="flex-1 bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg text-xs font-bold hover:bg-red-100 active:scale-95 transition-all"
                >
                  ABSENT
              </button>
              
              {/* Common Save Button */}
              <button 
                onClick={() => handleEntrySave(siteName, otHours, false)}
                className="flex-[2] bg-blue-600 text-white shadow-md shadow-blue-200 py-2 rounded-lg text-xs font-bold active:scale-95 transition-all"
              >
                SAVE ENTRY
              </button>
            </div>
            
             <button onClick={() => setShowEntryModal(false)} className="w-full text-center text-xs text-gray-400 py-1 hover:text-gray-600">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => (
    <div className="p-6 pt-6">
      <h2 className="text-2xl font-bold mb-6">Reports</h2>
      
      {data.calendars.length === 0 ? (
         <p className="text-gray-500">Please create a calendar first.</p>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Calendar</label>
            <select 
              value={activeCalendarId} 
              onChange={(e) => setActiveCalendarId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            >
              {data.calendars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-100">
            <h3 className="font-semibold text-lg mb-2">{activeCalendar?.name}</h3>
            <p className="text-gray-500 mb-6">Generate reports for {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => generatePDFReport(activeCalendar, data.entries, currentDate.getFullYear(), currentDate.getMonth())}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
              >
                <FileDown />
                <span>Download PDF</span>
              </button>
              
              <button 
                onClick={() => generateExcelReport(activeCalendar, data.entries, currentDate.getFullYear(), currentDate.getMonth())}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
              >
                <FileDown />
                <span>Download Excel</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderBackup = () => {
    const handleDownload = () => {
      const json = exportDataToJSON(data);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sitelog_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    };

    const handleGoogleSheetsExport = () => {
      generateGoogleSheetsCSV(data);
    };

    const handleShare = async () => {
      const json = exportDataToJSON(data);
      const file = new File([json], "backup.json", { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'SiteLog Backup',
            text: 'Here is my attendance backup.'
          });
        } catch (error) {
          console.log('Sharing failed', error);
        }
      } else {
        alert("Sharing not supported. Please use Download.");
      }
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const parsed = importDataFromJSON(content);
        if (parsed) {
          setData(parsed);
          alert("Restore Successful!");
        } else {
          alert("Invalid Backup File");
        }
      };
      reader.readAsText(file);
    };

    return (
      <div className="p-6 pt-6">
        <h2 className="text-2xl font-bold mb-6">Backup & Restore</h2>
        
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <div className="flex items-center space-x-3 mb-4 text-green-700">
              <Table size={24} />
              <h3 className="font-bold text-lg">Google Sheets</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">Export all data to CSV format for Google Sheets.</p>
             <button onClick={handleGoogleSheetsExport} className="w-full bg-green-600 text-white py-3 rounded-lg font-medium active:scale-95 transition-transform">
               Export for Google Sheets
             </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <div className="flex items-center space-x-3 mb-4 text-blue-600">
              <Share2 size={24} />
              <h3 className="font-bold text-lg">Full Backup</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">Save full app data to phone or share.</p>
            <div className="flex gap-2">
              <button onClick={handleDownload} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium">Download</button>
              <button onClick={handleShare} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium">Share / Drive</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
             <div className="flex items-center space-x-3 mb-4 text-orange-600">
              <Upload size={24} />
              <h3 className="font-bold text-lg">Restore Data</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">Select a previously saved .json backup file.</p>
            <label className="block w-full text-center bg-orange-50 border-2 border-dashed border-orange-200 text-orange-600 py-4 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
              <input type="file" accept=".json" onChange={handleUpload} className="hidden" />
              <span className="font-semibold">Select Backup File</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 fixed top-0 w-full z-20">
        <div className="flex items-center">
           <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full">
            <Menu size={28} />
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
             {currentView === 'HOME' ? 'My Calendars' : 
              currentView === 'CALENDAR' ? activeCalendar?.name :
              currentView === 'REPORTS' ? 'Reports' : 'Settings'}
          </h1>
          {currentView === 'CALENDAR' && data.calendars.length > 1 && (
             <select 
               value={activeCalendarId} 
               onChange={(e) => setActiveCalendarId(e.target.value)}
               className="text-xs text-gray-500 bg-transparent outline-none text-center"
             >
               {data.calendars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          )}
        </div>

        {/* Add Button - Only on Home Screen */}
        {currentView === 'HOME' ? (
          <button onClick={() => setShowAddCalendar(true)} className="p-2 -mr-2 text-blue-600 hover:bg-blue-50 rounded-full">
            <Plus size={28} />
          </button>
        ) : (
          <div className="w-10" /> // Spacer to keep title centered
        )}
      </header>

      {/* Main Content Area */}
      {/* Added mb-16 for Bottom Nav spacing */}
      <main className="flex-1 mt-16 mb-16 overflow-hidden relative overflow-y-auto">
        {currentView === 'HOME' && renderHome()}
        {currentView === 'CALENDAR' && (
          <CalendarView 
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            entries={data.entries}
            activeCalendar={activeCalendar}
            onDayClick={(date) => {
              setSelectedDate(date);
              setShowEntryModal(true);
            }}
          />
        )}
        {currentView === 'REPORTS' && renderReports()}
        {currentView === 'BACKUP' && renderBackup()}
        {currentView === 'QUICK_ADD' && (
           <div className="p-10 text-center text-gray-400">
             <p>Quick Attendance feature coming soon.</p>
             <button onClick={() => setCurrentView('HOME')} className="text-blue-500 mt-4 underline">Go Home</button>
           </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full h-16 bg-white border-t border-gray-200 flex items-center justify-around z-30 pb-safe">
        <button 
          onClick={() => setCurrentView('HOME')} 
          className="flex flex-col items-center justify-center w-full h-full pt-1"
        >
          <Home 
            size={22} 
            strokeWidth={1.5} 
            className={`${(currentView === 'HOME' || currentView === 'CALENDAR') ? 'text-black' : 'text-gray-300'}`} 
          />
          <span className={`text-[10px] font-['Open_Sans'] mt-1 ${(currentView === 'HOME' || currentView === 'CALENDAR') ? 'text-gray-500' : 'text-gray-300'}`}>
            Home
          </span>
        </button>
        
        <button 
          onClick={() => setCurrentView('REPORTS')} 
          className="flex flex-col items-center justify-center w-full h-full pt-1"
        >
          <FileSpreadsheet 
            size={22} 
            strokeWidth={1.5} 
            className={`${currentView === 'REPORTS' ? 'text-black' : 'text-gray-300'}`} 
          />
           <span className={`text-[10px] font-['Open_Sans'] mt-1 ${currentView === 'REPORTS' ? 'text-gray-500' : 'text-gray-300'}`}>
            Reports
          </span>
        </button>
      </nav>

      {/* Components */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onNavigate={setCurrentView}
      />
      {renderAddCalendarModal()}
      {renderEntryModal()}
    </div>
  );
};

export default App;