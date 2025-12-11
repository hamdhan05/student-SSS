import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHolidays, getTodayHoliday } from '@/lib/api';
import CalendarComponent from '@/components/UI/Calendar';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays'],
    queryFn: () => getHolidays(),
  });

  const { data: todayHoliday } = useQuery({
    queryKey: ['todayHoliday'],
    queryFn: getTodayHoliday,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Academic Calendar</h2>

      {todayHoliday && (
        <div className="card p-6 bg-yellow-900 bg-opacity-30 border-yellow-600">
          <h3 className="text-xl font-semibold text-yellow-400 mb-2">🎉 Today's Holiday</h3>
          <p className="text-white text-lg">{todayHoliday.name}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Component */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Calendar View</h3>
          <CalendarComponent 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Holidays List */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Upcoming Holidays</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {holidays
              .filter((h) => new Date(h.date) >= new Date())
              .map((holiday) => (
                <div key={holiday.id} className="p-4 bg-white bg-opacity-5 rounded border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{holiday.name}</h4>
                      <p className="text-sm text-gray-400">
                        {new Date(holiday.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-2xl">🎊</div>
                  </div>
                </div>
              ))}

            {holidays.filter((h) => new Date(h.date) >= new Date()).length === 0 && (
              <div className="text-center text-gray-400 py-8">No upcoming holidays</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}