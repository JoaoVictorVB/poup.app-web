import React, { useState } from 'react';
import type { Subscription } from '../interfaces';

interface CalendarPageApiProps {
  subscriptions: Subscription[];
  loading: boolean;
}

const CalendarPageApi: React.FC<CalendarPageApiProps> = ({ subscriptions, loading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  const startDate = new Date(startOfMonth);
  const dayOfWeek = startOfMonth.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToSubtract);

  const days = Array.from({ length: 35 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  const subsByDate = subscriptions.reduce((acc, sub) => {
    const date = new Date(sub.next_payment);
    const dateKey = date.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(sub);
    return acc;
  }, {} as Record<string, Subscription[]>);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Cabeçalho do calendário */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 rounded-md hover:bg-gray-100 border border-gray-300 font-semibold"
          >
            ← Anterior
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-md hover:bg-gray-100 border border-gray-300 font-semibold"
          >
            Hoje
          </button>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 rounded-md hover:bg-gray-100 border border-gray-300 font-semibold"
          >
            Próximo →
          </button>
        </div>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const subs = subsByDate[day.toDateString()] || [];
          const totalDay = subs.reduce((sum, sub) => sum + sub.price, 0);

          return (
            <div
              key={index}
              className={`min-h-24 border rounded-md p-2 overflow-y-auto ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-sm font-semibold ${
                    isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                  } ${isToday ? 'text-blue-600' : ''}`}
                >
                  {day.getDate()}
                </span>
                {totalDay > 0 && (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-1 rounded">
                    {formatCurrency(totalDay)}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {subs.map(sub => (
                  <div
                    key={sub.id}
                    className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-md truncate hover:bg-blue-200 transition cursor-pointer"
                    title={`${sub.name} - ${formatCurrency(sub.price)}`}
                  >
                    {sub.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-blue-500"></div>
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100"></div>
          <span>Pagamento agendado</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarPageApi;
