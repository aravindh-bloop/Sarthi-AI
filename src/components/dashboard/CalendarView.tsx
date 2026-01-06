import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Droplets, Sprout, Bug, ClipboardList } from 'lucide-react';
import type { Task } from '../../types';
// ... imports
import { clsx } from 'clsx';
import { CROP_CALENDAR } from '../../data/cropCalendar';

interface CalendarViewProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

// ... (existing code)

export default function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);


    // Generate days for grid (including padding for start of month if needed, though simple version here)
    const days = eachDayOfInterval({
        start: startOfMonth(monthStart),
        end: endOfMonth(monthEnd)
    });

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const getTasksForDay = (date: Date) => {
        return tasks.filter(task => isSameDay(new Date(task.date), date));
    };

    const currentMonthName = format(currentDate, 'MMMM yyyy');
    const currentMonthStr = format(currentDate, 'MMMM');

    // Helper to get active season and crops
    const getSeasonInfo = () => {
        // Simple logic: if many crops match a season for this month, show that season.
        // Or just list the crops active for sowing/harvesting this month.
        const sowingCrops = CROP_CALENDAR.filter(c => c.sowingMonths.includes(currentMonthStr));
        const harvestingCrops = CROP_CALENDAR.filter(c => c.harvestMonths.includes(currentMonthStr));

        let season = "off-season";
        // Rough estimation based on majority
        const allActive = [...sowingCrops, ...harvestingCrops];
        if (allActive.length > 0) {
            const counts = allActive.reduce((acc, curr) => {
                acc[curr.season] = (acc[curr.season] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            season = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        }

        return { season, sowing: sowingCrops.length, harvest: harvestingCrops.length };
    };

    const seasonInfo = getSeasonInfo();

    return (
        <div className="bg-gradient-to-br from-white/90 via-blue-50/50 to-emerald-50/50 backdrop-blur-md rounded-2xl shadow-lg shadow-indigo-100/20 border border-white/60 overflow-hidden flex flex-col h-full ring-1 ring-white/50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        {currentMonthName}
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase tracking-wide">
                            {seasonInfo.season} Season
                        </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Active Sowing: <span className="font-bold text-gray-700">{seasonInfo.sowing} crops</span> • Harvest: <span className="font-bold text-gray-700">{seasonInfo.harvest} crops</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Mobile View: Vertical List */}
            <div className="lg:hidden flex-1 overflow-y-auto p-4 space-y-4">
                {days.map((day) => {
                    const dayTasks = getTasksForDay(day);
                    if (dayTasks.length === 0) return null; // Hide empty days on mobile to save space

                    return (
                        <div key={day.toString()} className="space-y-2">
                            <div className={clsx(
                                "text-sm font-medium sticky top-0 bg-white/95 backdrop-blur py-1 z-10",
                                isToday(day) ? "text-green-600" : "text-gray-500"
                            )}>
                                {format(day, 'EEEE, MMM d')}
                            </div>
                            <div className="space-y-2">
                                {dayTasks.map(task => (
                                    <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop View: Grid */}
            <div className="hidden lg:grid grid-cols-7 flex-1 border-gray-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-400 bg-gray-50/50 border-b border-gray-100">
                        {day}
                    </div>
                ))}
                {/* Placeholder for empty start days could be added here */}

                {days.map(day => {
                    const dayTasks = getTasksForDay(day);
                    return (
                        <div
                            key={day.toString()}
                            className={clsx(
                                "min-h-[100px] p-2 border-b border-r border-gray-100 hover:bg-gray-50/30 transition-colors relative group",
                                !isSameMonth(day, monthStart) && "bg-gray-50/50 text-gray-400"
                            )}
                        >
                            <div className={clsx(
                                "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                                isToday(day) ? "bg-green-600 text-white shadow-md" : "text-gray-500"
                            )}>
                                {format(day, 'd')}
                            </div>

                            <div className="space-y-1">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => onTaskClick(task)}
                                        className={clsx(
                                            "text-[10px] px-1.5 py-1 rounded-md border truncate cursor-pointer transition-all hover:scale-105 shadow-sm",
                                            getTaskColor(task.type)
                                        )}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function TaskCard({ task, onClick }: { task: Task, onClick: () => void }) {
    const Icon = getTaskIcon(task.type);
    return (
        <div
            onClick={onClick}
            className={clsx(
                "flex items-center gap-3 p-3 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer",
                "border-l-4",
                getTaskBorderColor(task.type)
            )}
        >
            <div className={clsx("p-2 rounded-lg", getTaskIconBg(task.type))}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <h4 className="text-sm font-medium text-gray-800">{task.title}</h4>
                <p className="text-xs text-gray-500 capitalize">{task.type}</p>
            </div>
        </div>
    );
}


// Helpers
function getTaskColor(type: Task['type']) {
    switch (type) {
        case 'irrigation': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'sowing': return 'bg-green-50 text-green-700 border-green-200';
        case 'fertilization': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'weeding': return 'bg-orange-50 text-orange-700 border-orange-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
}
function getTaskBorderColor(type: Task['type']) {
    switch (type) {
        case 'irrigation': return 'border-l-blue-500';
        case 'sowing': return 'border-l-green-500';
        case 'fertilization': return 'border-l-purple-500';
        default: return 'border-l-gray-400';
    }
}
function getTaskIconBg(type: Task['type']) {
    switch (type) {
        case 'irrigation': return 'bg-blue-100 text-blue-600';
        case 'sowing': return 'bg-green-100 text-green-600';
        default: return 'bg-gray-100 text-gray-600';
    }
}
function getTaskIcon(type: Task['type']) {
    switch (type) {
        case 'irrigation': return Droplets;
        case 'sowing': return Sprout;
        case 'weeding': return Bug;
        default: return ClipboardList;
    }
}
