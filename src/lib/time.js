export const formatTimeValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return '—';
  }

  return String(value);
};

export const formatDurationMinutes = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return `${value} min${value === 1 ? '' : 's'}`;
};
