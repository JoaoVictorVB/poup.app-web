import React, { useState } from 'react';
import type { Subscription } from '../types';

interface CalendarPageProps {
  subscriptions: Subscription[];
}

const CalendarPage: React.FC<CalendarPageProps> = ({ subscriptions }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - (startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1));
    const days = Array.from({ length: 35 }, (_, i) => { const date = new Date(startDate); date.setDate(date.getDate() + i); return date; });
    const subsByDate = subscriptions.reduce((acc, sub) => { const date = new Date(sub.nextPayment).toDateString(); if (!acc[date]) acc[date] = []; acc[date].push(sub); return acc; }, {} as Record<string, Subscription[]>);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                <div>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-md hover:bg-gray-100">{'<'}</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-md hover:bg-gray-100">{'>'}</button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => <div key={d}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1 mt-2">
                {days.map((d, i) => {
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                    const subs = subsByDate[d.toDateString()] || [];
                    return (
                        <div key={i} className={`h-32 border rounded-md p-2 overflow-y-auto ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}>
                            <span className={`${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>{d.getDate()}</span>
                            <div className="mt-1 space-y-1">
                                {subs.map(sub => (<div key={sub.id} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-md truncate">{sub.name}</div>))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarPage;