// Lesson 1 & 2: ES6 Utility function
export const formatVND = (amount) => {
  if (!amount || isNaN(amount)) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};