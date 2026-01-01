export const formatLabel = (date: Date, withTime = false): string => {
  const day = date.getDate();
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const month = monthNames[date.getMonth()];
  
  if (!withTime) {
    return `${day} ${month}`;
  }
  
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month}\n${hh}:${mm}`;
};

export const formatMySQLDatetime = (d: Date): string => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
};

export const formatDateToWIB = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatThousands = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};