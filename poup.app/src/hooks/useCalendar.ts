import { useEffect, useState } from 'react';
import type { CalendarEvent } from '../interfaces';
import { calendarService } from '../services/api';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await calendarService.getAll();
      setEvents(data);
    } catch (err) {
      setError('Erro ao carregar eventos');
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const createEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at'>): Promise<CalendarEvent> => {
    try {
      const newEvent = await calendarService.create(event);
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      throw err;
    }
  };

  const updateEvent = async (id: string, event: Partial<Omit<CalendarEvent, 'id' | 'created_at'>>): Promise<CalendarEvent> => {
    try {
      const updatedEvent = await calendarService.update(id, event);
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
      return updatedEvent;
    } catch (err) {
      console.error('Erro ao atualizar evento:', err);
      throw err;
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    try {
      await calendarService.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Erro ao deletar evento:', err);
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}
