import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useCalendarStore } from "../../store/calendarStore";
import CreateEventModal from "./CreateEventModal";
import EventDetailModal from "./EventDetailModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_TYPE_COLORS = {
  TASK_DEADLINE: { bg: "#E67E22", name: "Task Due" },
  MILESTONE_DEADLINE: { bg: "#8E44AD", name: "Milestone" },
  MEETING: { bg: "#27AE60", name: "Meeting" },
  CUSTOM: { bg: "#4A90D9", name: "Custom Event" },
};

export default function CalendarSection() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-12
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { events, setEvents, view, setView } = useCalendarStore();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDefaultDate, setSelectedDefaultDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch month events
  const fetchMonthEvents = async (year, month) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/calendar/month/${year}/${month}`);
      const loadedEvents = res.data.data.events || [];
      setEvents(loadedEvents);
      setView(year, month);
    } catch (err) {
      console.error("Failed to fetch calendar events:", err);
      setError("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthEvents(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  const openAddModal = (dateStr = null) => {
    setSelectedDefaultDate(dateStr);
    setIsCreateOpen(true);
  };

  // Helper to construct grid days for current month view
  const getCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0-6 (Sun-Sat)
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

    const calendarGrid = [];

    // Previous month padding days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthVal = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYearVal = currentMonth === 1 ? currentYear - 1 : currentYear;
      calendarGrid.push({
        dayNum,
        month: prevMonthVal,
        year: prevYearVal,
        isCurrentMonth: false,
        dateKey: `${prevYearVal}-${String(prevMonthVal).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      calendarGrid.push({
        dayNum,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateKey: `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
      });
    }

    // Next month padding days to fill 35 or 42 grid cells
    const remainingGridCount = (7 - (calendarGrid.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingGridCount; dayNum++) {
      const nextMonthVal = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYearVal = currentMonth === 12 ? currentYear + 1 : currentYear;
      calendarGrid.push({
        dayNum,
        month: nextMonthVal,
        year: nextYearVal,
        isCurrentMonth: false,
        dateKey: `${nextYearVal}-${String(nextMonthVal).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
      });
    }

    return calendarGrid;
  };

  // Helper to find events for a specific date cell
  const getEventsForDate = (dateKey) => {
    return events.filter((ev) => {
      if (!ev.startDate) return false;
      const eventStartStr = new Date(ev.startDate).toISOString().slice(0, 10);
      return eventStartStr === dateKey;
    });
  };

  const isToday = (dayObj) => {
    const today = new Date();
    return (
      dayObj.isCurrentMonth &&
      dayObj.dayNum === today.getDate() &&
      dayObj.month === today.getMonth() + 1 &&
      dayObj.year === today.getFullYear()
    );
  };

  const gridDays = getCalendarDays();

  return (
    <div className="space-y-6">
      {/* Calendar Top Control Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight m-0">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </h1>
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <p className="text-xs text-slate-500 m-0 mt-1">
            Unified schedule for project task deadlines, milestones, meetings, and personal events.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Legend */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs">
            {Object.entries(EVENT_TYPE_COLORS).map(([type, meta]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.bg }} />
                <span className="text-slate-600 font-medium">{meta.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-white hover:shadow-xs transition-all font-bold text-sm border-0 cursor-pointer"
              title="Previous Month"
            >
              ◀
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-white hover:shadow-xs transition-all font-semibold text-xs border-0 cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-white hover:shadow-xs transition-all font-bold text-sm border-0 cursor-pointer"
              title="Next Month"
            >
              ▶
            </button>
          </div>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors border-0 cursor-pointer shadow-md shadow-indigo-100"
          >
            <span>+</span> Add Event
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchMonthEvents(currentYear, currentMonth)}
            className="text-xs underline font-bold bg-transparent border-0 cursor-pointer text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Calendar Month Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center py-2.5 font-bold text-xs text-slate-500 uppercase tracking-wider">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
          {gridDays.map((dayObj, idx) => {
            const dayEvents = getEventsForDate(dayObj.dateKey);
            const todayFlag = isToday(dayObj);

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-1.5 transition-colors relative flex flex-col justify-between group ${
                  dayObj.isCurrentMonth ? "bg-white" : "bg-slate-50/60 text-slate-400"
                } ${todayFlag ? "bg-indigo-50/30" : ""}`}
              >
                {/* Date Cell Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      todayFlag
                        ? "bg-indigo-600 text-white shadow-sm"
                        : dayObj.isCurrentMonth
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {dayObj.dayNum}
                  </span>

                  <button
                    onClick={() => openAddModal(dayObj.dateKey)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 text-xs font-bold bg-slate-100 hover:bg-indigo-50 w-5 h-5 rounded flex items-center justify-center border-0 cursor-pointer transition-all"
                    title="Add event on this date"
                  >
                    +
                  </button>
                </div>

                {/* Day Events Container */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                  {dayEvents.map((ev) => {
                    const eventBg = ev.color || EVENT_TYPE_COLORS[ev.eventType]?.bg || "#4A90D9";
                    return (
                      <div
                        key={ev._id}
                        onClick={() => setSelectedEvent(ev)}
                        className="px-2 py-1 rounded-md text-[11px] font-semibold text-white truncate cursor-pointer shadow-2xs hover:opacity-90 transition-opacity flex items-center gap-1"
                        style={{ backgroundColor: eventBg }}
                        title={`${ev.title} (${ev.eventType})`}
                      >
                        <span className="truncate">{ev.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultDate={selectedDefaultDate}
      />

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
