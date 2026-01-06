// Format number to Philippine Peso
export const formatCurrency = (amount) => {
  return `₱${Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Parse currency string to number
export const parseCurrency = (currencyString) => {
  return parseFloat(currencyString.replace(/[₱,]/g, ''));
};
