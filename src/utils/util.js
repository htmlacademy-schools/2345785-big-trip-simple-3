import dayjs from 'dayjs';

const EVENT_DATE_FORMAT = 'MMM D';
const EVENT_TIME_FORMAT = 'H:mm';
const EVENT_YEARS_FORMAT = 'DD/MM/YY HH:mm';

export const isEsc = (evt) => evt.key === 'Escape';

export const getDateWithoutT = (dateStr) => dateStr.substring(0, dateStr.indexOf('T'));

export const getDateDayAndMo = (dateStr) => dayjs(dateStr).format(EVENT_DATE_FORMAT);

export const getDateWithT = (dateStr) => dateStr.substring(0, dateStr.lastIndexOf(':'));

export const getTime = (dateStr) => dayjs(dateStr).format(EVENT_TIME_FORMAT);

export const getDateYears = (date) => dayjs(date).format(EVENT_YEARS_FORMAT);

export const makeFirstLetterUpperCase = (word) => word.charAt(0).toUpperCase() + word.slice(1);

export const isFuture = (date) => date && dayjs().isBefore(date, 'D');

export const isPast = (date) => date && dayjs().isAfter(date, 'D');

export const isDatesEqual = (date1, date2) => (!date1 && !date2) || dayjs(date1).isSame(date2, 'D');

export const getItemFromItemsById = (items, id) => (items.find((item) => item.id === id));

export const generateKey = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
