import Purchases from 'react-native-purchases';

export const initRevenueCat = () => {
  Purchases.configure({ apiKey: "PUBLIC_SDK_KEY" });
};

export const getCustomerInfo = async () => {
  return await Purchases.getCustomerInfo();
};