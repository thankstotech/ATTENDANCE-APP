import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AttendanceEntry, CalendarConfig, AppData } from '../types';

// Helper to filter entries for a specific month
const getEntriesForMonth = (
  entries: Record<string, AttendanceEntry>,
  calendarId: string,
  year: number,
  month: number // 0-11
): AttendanceEntry[] => {
  return Object.values(entries).filter(entry => {
    const d = new Date(entry.date);
    return (
      entry.calendarId === calendarId &&
      d.getFullYear() === year &&
      d.getMonth() === month
    );
  }).sort((a, b) => a.date.localeCompare(b.date));
};

export const generatePDFReport = (
  calendar: CalendarConfig,
  entries: Record<string, AttendanceEntry>,
  year: number,
  month: number
) => {
  const doc = new jsPDF();
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  const reportData = getEntriesForMonth(entries, calendar.id, year, month);

  doc.setFontSize(18);
  doc.text(`${calendar.name} - Attendance Report`, 14, 22);
  doc.setFontSize(12);
  doc.text(`Period: ${monthName} ${year}`, 14, 30);

  const tableBody = reportData.map(entry => {
    let type = 'Present';
    let details = '';

    if (entry.isAbsent) {
      type = 'Absent';
      details = 'ABSENT';
    } else {
      details = entry.siteName || '';
      if (entry.otHours) {
        details += details ? ` (OT: ${entry.otHours})` : `OT: ${entry.otHours}`;
      }
    }

    return [
      entry.date,
      type,
      details
    ];
  });

  autoTable(doc, {
    startY: 35,
    head: [['Date', 'Status', 'Details (Site / OT)']],
    body: tableBody,
  });

  doc.save(`${calendar.name}_Report_${year}_${month + 1}.pdf`);
};

export const generateExcelReport = (
  calendar: CalendarConfig,
  entries: Record<string, AttendanceEntry>,
  year: number,
  month: number
) => {
  const reportData = getEntriesForMonth(entries, calendar.id, year, month);
  
  const excelData = reportData.map(entry => ({
    Date: entry.date,
    Status: entry.isAbsent ? 'ABSENT' : 'PRESENT',
    'Site Name': entry.siteName,
    'OT Hours': entry.otHours,
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  
  XLSX.writeFile(wb, `${calendar.name}_Report_${year}_${month + 1}.xlsx`);
};

export const generateGoogleSheetsCSV = (data: AppData) => {
  // Flatten all data for a "Database" style export
  const allRows = Object.values(data.entries).map(entry => {
    const calendar = data.calendars.find(c => c.id === entry.calendarId);
    return {
      Date: entry.date,
      'Calendar Name': calendar ? calendar.name : 'Unknown',
      'Calendar Type': calendar ? (calendar.type === 'TEAM' ? 'Team' : 'Sub-Con') : '-',
      Status: entry.isAbsent ? 'ABSENT' : 'PRESENT',
      'Site Name': entry.siteName,
      'OT Hours': entry.otHours
    };
  });

  // Sort by date descending
  allRows.sort((a, b) => b.Date.localeCompare(a.Date));

  const ws = XLSX.utils.json_to_sheet(allRows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SiteLog_GoogleSheets_Export_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};