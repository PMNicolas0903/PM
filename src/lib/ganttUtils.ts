import { eachDayOfInterval, format, getMonth, getYear, isWeekend, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
export const getGanttTimelineDates = (tasks: { startDate: string; endDate: string }[]) => {
  if (tasks.length === 0) {
    const now = new Date();
    return {
      startDate: startOfMonth(now),
      endDate: endOfMonth(now),
    };
  }
  const allDates = tasks.flatMap(task => [new Date(task.startDate), new Date(task.endDate)]);
  const minDate = new Date(Math.min(...allDates.map(date => date.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(date => date.getTime())));
  return {
    startDate: startOfMonth(minDate),
    endDate: endOfMonth(maxDate),
  };
};
export const generateDateHeaders = (startDate: Date, endDate: Date) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const months: { name: string; year: number; dayCount: number }[] = [];
  days.forEach(day => {
    const year = getYear(day);
    const month = getMonth(day);
    const monthName = format(day, 'MMMM');
    const lastMonth = months[months.length - 1];
    if (!lastMonth || lastMonth.name !== monthName || lastMonth.year !== year) {
      months.push({ name: monthName, year, dayCount: 1 });
    } else {
      lastMonth.dayCount++;
    }
  });
  return { days, months };
};
export const calculateWorkingDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const days = eachDayOfInterval({ start, end });
  days.forEach(day => {
    if (!isWeekend(day)) {
      count++;
    }
  });
  return count;
};