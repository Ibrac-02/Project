/**
 * Malawi Public Holidays - Dynamic calendar integration
 * Includes all official public holidays in Malawi with proper date calculations
 */

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD format
  type: 'fixed' | 'variable' | 'religious';
  description?: string;
  isNational: boolean;
}

// Helper function to calculate Easter Sunday for a given year
const calculateEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = Math.floor((h + l - 7 * m + 114) / 31);
  const p = (h + l - 7 * m + 114) % 31;
  return new Date(year, n - 1, p + 1);
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Generate Malawi public holidays for a given year
export const generateMalawiHolidays = (year: number): Holiday[] => {
  const holidays: Holiday[] = [];

  // Fixed holidays
  const fixedHolidays = [
    {
      name: "New Year's Day",
      month: 1,
      day: 1,
      description: "First day of the Gregorian calendar year"
    },
    {
      name: "John Chilembwe Day",
      month: 1,
      day: 15,
      description: "Commemorates the Malawian independence activist"
    },
    {
      name: "Martyrs' Day",
      month: 3,
      day: 3,
      description: "Honors those who died fighting for independence"
    },
    {
      name: "Labour Day",
      month: 5,
      day: 1,
      description: "International Workers' Day"
    },
    {
      name: "Kamuzu Day",
      month: 5,
      day: 14,
      description: "Commemorates Hastings Kamuzu Banda"
    },
    {
      name: "Independence Day",
      month: 7,
      day: 6,
      description: "Malawi's independence from British rule (1964)"
    },
    {
      name: "Mother's Day",
      month: 10,
      day: 15,
      description: "Honors mothers and motherhood"
    },
    {
      name: "Christmas Day",
      month: 12,
      day: 25,
      description: "Christian celebration of the birth of Jesus Christ"
    },
    {
      name: "Boxing Day",
      month: 12,
      day: 26,
      description: "Day after Christmas, traditionally for giving to the poor"
    }
  ];

  // Add fixed holidays
  fixedHolidays.forEach((holiday, index) => {
    holidays.push({
      id: `fixed-${year}-${index}`,
      name: holiday.name,
      date: `${year}-${String(holiday.month).padStart(2, '0')}-${String(holiday.day).padStart(2, '0')}`,
      type: 'fixed',
      description: holiday.description,
      isNational: true
    });
  });

  // Calculate Easter-based holidays
  const easter = calculateEaster(year);
  
  const easterHolidays = [
    {
      name: "Good Friday",
      offset: -2,
      description: "Christian commemoration of the crucifixion of Jesus Christ"
    },
    {
      name: "Easter Monday",
      offset: 1,
      description: "Christian celebration following Easter Sunday"
    }
  ];

  easterHolidays.forEach((holiday, index) => {
    const holidayDate = addDays(easter, holiday.offset);
    holidays.push({
      id: `easter-${year}-${index}`,
      name: holiday.name,
      date: formatDate(holidayDate),
      type: 'religious',
      description: holiday.description,
      isNational: true
    });
  });

  // Sort holidays by date
  holidays.sort((a, b) => a.date.localeCompare(b.date));

  return holidays;
};

// Get holidays for multiple years (useful for calendar views)
export const getHolidaysForYears = (startYear: number, endYear: number): Holiday[] => {
  const allHolidays: Holiday[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    allHolidays.push(...generateMalawiHolidays(year));
  }
  
  return allHolidays;
};

// Get holidays for a specific month
export const getHolidaysForMonth = (year: number, month: number): Holiday[] => {
  const yearHolidays = generateMalawiHolidays(year);
  const monthStr = String(month).padStart(2, '0');
  
  return yearHolidays.filter(holiday => 
    holiday.date.startsWith(`${year}-${monthStr}`)
  );
};

// Check if a date is a holiday
export const isHoliday = (date: string): Holiday | null => {
  const [year] = date.split('-').map(Number);
  const holidays = generateMalawiHolidays(year);
  
  return holidays.find(holiday => holiday.date === date) || null;
};

// Get next upcoming holiday
export const getNextHoliday = (): Holiday | null => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const todayStr = formatDate(today);
  
  // Get holidays for current and next year
  const holidays = [
    ...generateMalawiHolidays(currentYear),
    ...generateMalawiHolidays(currentYear + 1)
  ];
  
  // Find next holiday after today
  return holidays.find(holiday => holiday.date > todayStr) || null;
};

// Academic calendar specific holidays (can be customized by schools)
export const getAcademicYearHolidays = (academicYear: string): Holiday[] => {
  // Academic year typically runs from January to December in Malawi
  const year = parseInt(academicYear);
  return generateMalawiHolidays(year);
};

// Export current year holidays for immediate use
export const CURRENT_YEAR_HOLIDAYS = generateMalawiHolidays(new Date().getFullYear());
