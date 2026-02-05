import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isMarketOpen(): boolean {
    // Current time in Jakarta (UTC+7)
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

    const day = jakartaTime.getDay();
    const hour = jakartaTime.getHours();
    const minute = jakartaTime.getMinutes();

    // Weekend check (0 is Sunday, 6 is Saturday)
    if (day === 0 || day === 6) return false;

    // Market hours: 09:10 - 16:10
    const minutesOfDay = hour * 60 + minute;
    const startMinutes = 9 * 60 + 10;  // 09:10
    const endMinutes = 16 * 60 + 10; // 16:10

    return minutesOfDay >= startMinutes && minutesOfDay < endMinutes;
}
