/**
 * Utility functions for managing localStorage for UI configurations
 * and other non-sensitive client-side data.
 */

export interface StorageConfig {
    key: string;
    defaultValue?: any;
    serialize?: (value: any) => string;
    deserialize?: (value: string) => any;
}

/**
 * Get a value from localStorage with error handling
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") {
        return defaultValue;
    }

    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.warn(`Failed to read from localStorage (key: ${key}):`, error);
        return defaultValue;
    }
}

/**
 * Set a value to localStorage with error handling
 */
export function setToStorage<T>(key: string, value: T): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`Failed to write to localStorage (key: ${key}):`, error);
        return false;
    }
}

/**
 * Remove a value from localStorage
 */
export function removeFromStorage(key: string): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn(
            `Failed to remove from localStorage (key: ${key}):`,
            error
        );
        return false;
    }
}

/**
 * Check if a key exists in localStorage
 */
export function hasInStorage(key: string): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        return localStorage.getItem(key) !== null;
    } catch (error) {
        console.warn(`Failed to check localStorage (key: ${key}):`, error);
        return false;
    }
}

/**
 * Get all keys from localStorage that match a prefix
 */
export function getStorageKeys(prefix?: string): string[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (!prefix || key.startsWith(prefix))) {
                keys.push(key);
            }
        }
        return keys;
    } catch (error) {
        console.warn("Failed to get localStorage keys:", error);
        return [];
    }
}

/**
 * Clear all localStorage items that match a prefix
 */
export function clearStorageByPrefix(prefix: string): number {
    if (typeof window === "undefined") {
        return 0;
    }

    try {
        const keysToRemove = getStorageKeys(prefix);
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        return keysToRemove.length;
    } catch (error) {
        console.warn(
            `Failed to clear localStorage with prefix (${prefix}):`,
            error
        );
        return 0;
    }
}

/**
 * Hook for using localStorage with React state
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = React.useState<T>(() =>
        getFromStorage(key, defaultValue)
    );

    const setStoredValue = React.useCallback(
        (newValue: T | ((prev: T) => T)) => {
            try {
                const valueToStore =
                    newValue instanceof Function ? newValue(value) : newValue;
                setValue(valueToStore);
                setToStorage(key, valueToStore);
            } catch (error) {
                console.warn(
                    `Failed to update localStorage (key: ${key}):`,
                    error
                );
            }
        },
        [key, value]
    );

    return [value, setStoredValue] as const;
}

// Pre-defined storage keys for common UI configurations
export const STORAGE_KEYS = {
    SIDEBAR_STATE: "sidebar_state",
    THEME_PREFERENCE: "theme_preference",
    USER_PREFERENCES: "user_preferences",
    QUIZ_SETTINGS: "quiz_settings",
    NOTIFICATION_SETTINGS: "notification_settings",
    LAYOUT_PREFERENCES: "layout_preferences",
} as const;

// Import React for the hook
import * as React from "react";
