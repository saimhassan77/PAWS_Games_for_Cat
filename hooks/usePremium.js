import { useEffect, useState } from "react";
import { getCustomerInfo } from "../services/revenuecat";

export default function usePremium() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const check = async () => {
      const info = await getCustomerInfo();

      const premium =
        info.entitlements.active["premium"] != null;

      setIsPremium(premium);
    };

    check();
  }, []);

  return isPremium;
}