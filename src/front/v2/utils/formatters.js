// src/front/v2/utils/formatters.js
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return (0).toFixed(decimals);
  const num = Number(value);
  if (Number.isNaN(num)) return (0).toFixed(decimals);
  return num.toFixed(decimals);
}
