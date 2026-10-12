// Tính % hoa hồng xe bán hộ dựa trên giá trị xe
export const calculateCommission = (price, ratePercent = 2.5) => {
  const priceNum = Number(price) || 0;
  return (priceNum * ratePercent) / 100;
};