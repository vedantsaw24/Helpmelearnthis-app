/**
 * Example component demonstrating how to use the localStorage utilities
 * for UI configurations and user preferences.
 */

import React from "react";
import {
    useLocalStorage,
    STORAGE_KEYS,
    setToStorage,
    getFromStorage,
} from "@/lib/storage";

interface UserPreferences {
    notifications: boolean;
    autoSave: boolean;
    compactMode: boolean;
    defaultDifficulty: "easy" | "medium" | "hard";
}

const defaultPreferences: UserPreferences = {
    notifications: true,
    autoSave: true,
    compactMode: false,
    defaultDifficulty: "medium",
};

export function UserPreferencesExample() {
    // Method 1: Using the useLocalStorage hook
    const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
        STORAGE_KEYS.USER_PREFERENCES,
        defaultPreferences
    );

    // Method 2: Using direct storage functions (useful in event handlers or effects)
    const handleResetPreferences = () => {
        setToStorage(STORAGE_KEYS.USER_PREFERENCES, defaultPreferences);
        setPreferences(defaultPreferences);
    };

    const handleToggleNotifications = () => {
        const newPreferences = {
            ...preferences,
            notifications: !preferences.notifications,
        };
        setPreferences(newPreferences);
    };

    // Method 3: Reading from storage without state (useful for one-time reads)
    React.useEffect(() => {
        const currentTheme = getFromStorage(
            STORAGE_KEYS.THEME_PREFERENCE,
            "system"
        );
        console.log("Current theme:", currentTheme);
    }, []);

    return (
        <div className="space-y-4 p-4">
            <h3 className="text-lg font-semibold">User Preferences</h3>

            <div className="space-y-2">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={handleToggleNotifications}
                    />
                    Enable Notifications
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={preferences.autoSave}
                        onChange={(e) =>
                            setPreferences({
                                ...preferences,
                                autoSave: e.target.checked,
                            })
                        }
                    />
                    Auto Save
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={preferences.compactMode}
                        onChange={(e) =>
                            setPreferences({
                                ...preferences,
                                compactMode: e.target.checked,
                            })
                        }
                    />
                    Compact Mode
                </label>

                <label className="flex flex-col gap-1">
                    <span>Default Difficulty:</span>
                    <select
                        value={preferences.defaultDifficulty}
                        onChange={(e) =>
                            setPreferences({
                                ...preferences,
                                defaultDifficulty: e.target.value as
                                    | "easy"
                                    | "medium"
                                    | "hard",
                            })
                        }
                        className="w-fit px-2 py-1 border rounded"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </label>
            </div>

            <button
                onClick={handleResetPreferences}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Reset to Defaults
            </button>

            <div className="text-sm text-gray-600">
                <p>Preferences are automatically saved to localStorage.</p>
                <p>Current settings: {JSON.stringify(preferences, null, 2)}</p>
            </div>
        </div>
    );
}
