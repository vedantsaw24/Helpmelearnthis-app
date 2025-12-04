import { useState, useEffect, useRef } from "react";

export interface TimeTracker {
    startTime: number;
    endTime: number;
    totalTime: number;
    isActive: boolean;
}

export function useTimeTracker() {
    const [startTime, setStartTime] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [totalTime, setTotalTime] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const start = () => {
        const now = Date.now();
        setStartTime(now);
        setCurrentTime(now);
        setIsActive(true);

        intervalRef.current = setInterval(() => {
            setCurrentTime(Date.now());
        }, 100); // Update every 100ms for smooth display
    };

    const stop = (): number => {
        const now = Date.now();
        setCurrentTime(now);
        setIsActive(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        const finalTime = Math.floor((now - startTime) / 1000);
        setTotalTime(finalTime);
        return finalTime;
    };

    const reset = () => {
        setStartTime(0);
        setCurrentTime(0);
        setTotalTime(0);
        setIsActive(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const getElapsedTime = (): number => {
        if (!startTime) return 0;
        const elapsed =
            (isActive ? currentTime : currentTime || Date.now()) - startTime;
        return Math.floor(elapsed / 1000);
    };

    const getFormattedTime = (): string => {
        const elapsed = getElapsedTime();
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        start,
        stop,
        reset,
        getElapsedTime,
        getFormattedTime,
        totalTime,
        isActive,
    };
}
