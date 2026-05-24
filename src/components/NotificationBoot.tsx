import { useEffect } from "react";
import { rescheduleAll } from "@/lib/notifications";

export function NotificationBoot() {
  useEffect(() => {
    rescheduleAll();
  }, []);
  return null;
}
