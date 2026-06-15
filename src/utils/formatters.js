export const formatCurrency = (amount, symbol = '$') => {
  const num = parseFloat(amount) || 0;
  return `${symbol}${num.toFixed(2)}`;
};

export const formatDate = (unixSeconds) => {
  if (!unixSeconds) return '';
  const date = new Date(unixSeconds * 1000);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateShort = (unixSeconds) => {
  if (!unixSeconds) return '';
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

export const getInitials = (name = '') => {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
};

const AVATAR_COLORS = [
  '#E53935', '#8E24AA', '#1E88E5', '#00897B',
  '#43A047', '#F4511E', '#6D4C41', '#546E7A',
];

export const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
