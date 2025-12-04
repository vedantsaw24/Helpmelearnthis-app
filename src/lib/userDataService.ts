// Simple userDataService for localStorage-based data management

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    lastLoginAt: Date;
    preferences: {
        theme: "light" | "dark" | "system";
        difficulty: "easy" | "medium" | "hard";
        notifications: boolean;
        emailNotifications: boolean;
        soundEffects: boolean;
        autoSubmit: boolean;
        showExplanations: boolean;
        language: string;
    };
    stats: {
        totalQuizzes: number;
        totalQuestions: number;
        totalCorrect: number;
        totalTimeSpent: number;
        averageScore: number;
        streak: number;
        longestStreak: number;
        lastQuizDate?: Date;
        level: number;
        xp: number;
        achievements: Achievement[];
    };
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
    progress: number;
    target: number;
}

export interface QuizResult {
    id: string;
    title: string;
    topic: string;
    difficulty: "easy" | "medium" | "hard";
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    completedAt: Date;
    questions: any[];
    userAnswers: any[];
}

export interface QuizSession {
    userId: string;
    title: string;
    topic: string;
    difficulty: "easy" | "medium" | "hard";
    questionsCount: number;
    correctAnswers: number;
    score: number;
    timeSpent: number;
    completedAt: Date;
    questions: {
        question: string;
        userAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        timeSpent: number;
    }[];
}

class UserDataService {
    private readonly STORAGE_KEYS = {
        USER_PROFILE: "helpmelearnthis_user_profile",
        QUIZ_RESULTS: "helpmelearnthis_quiz_results",
    };

    private isClient(): boolean {
        return (
            typeof window !== "undefined" && typeof localStorage !== "undefined"
        );
    }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            if (!this.isClient()) {
                console.warn(
                    "getUserProfile called on server-side, returning null"
                );
                return null;
            }
            const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PROFILE);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error("Error getting user profile:", error);
            return null;
        }
    }

    async createUserProfile(user: any): Promise<UserProfile> {
        const achievements: Achievement[] = [
            {
                id: "first_quiz",
                name: "Getting Started",
                description: "Complete your first quiz",
                icon: "🎯",
                progress: 0,
                target: 1,
            },
            {
                id: "quiz_master",
                name: "Quiz Master",
                description: "Complete 10 quizzes",
                icon: "🏆",
                progress: 0,
                target: 10,
            },
            {
                id: "perfectionist",
                name: "Perfectionist",
                description: "Score 100% on a quiz",
                icon: "💎",
                progress: 0,
                target: 1,
            },
            {
                id: "speed_demon",
                name: "Speed Demon",
                description: "Complete a quiz in under 30 seconds",
                icon: "⚡",
                progress: 0,
                target: 1,
            },
            {
                id: "streak_keeper",
                name: "Streak Keeper",
                description: "Maintain a 7-day learning streak",
                icon: "🔥",
                progress: 0,
                target: 7,
            },
            {
                id: "knowledge_seeker",
                name: "Knowledge Seeker",
                description: "Answer 100 questions correctly",
                icon: "📚",
                progress: 0,
                target: 100,
            },
        ];

        const profile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split("@")[0],
            photoURL: user.photoURL,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            preferences: {
                theme: "system",
                difficulty: "medium",
                notifications: true,
                emailNotifications: false,
                soundEffects: true,
                autoSubmit: false,
                showExplanations: true,
                language: "en",
            },
            stats: {
                totalQuizzes: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                totalTimeSpent: 0,
                averageScore: 0,
                streak: 0,
                longestStreak: 0,
                level: 1,
                xp: 0,
                achievements,
            },
        };

        await this.saveUserProfile(profile);
        return profile;
    }

    async saveUserProfile(profile: UserProfile): Promise<void> {
        try {
            if (!this.isClient()) {
                console.warn("saveUserProfile called on server-side, skipping");
                return;
            }
            // Remove any sensitive data before saving
            const sanitizedProfile = {
                ...profile,
                // Never store API keys or sensitive tokens
                apiKeys: undefined,
                tokens: undefined,
                secretKeys: undefined,
            };

            localStorage.setItem(
                this.STORAGE_KEYS.USER_PROFILE,
                JSON.stringify(sanitizedProfile)
            );
        } catch (error) {
            console.error("Error saving user profile:", error);
        }
    }

    async updateUserProfile(
        userId: string,
        updates: Partial<UserProfile>
    ): Promise<UserProfile> {
        let profile = await this.getUserProfile(userId);
        if (!profile) {
            profile = await this.createUserProfile({
                uid: userId,
                email: "user@example.com",
                displayName: "User",
            });
        }

        const updatedProfile = {
            ...profile,
            ...updates,
            lastLoginAt: new Date(),
        };
        await this.saveUserProfile(updatedProfile);
        return updatedProfile;
    }

    async saveQuizResult(result: QuizResult): Promise<void> {
        try {
            if (!this.isClient()) {
                console.warn("saveQuizResult called on server-side, skipping");
                return;
            }
            const results = await this.getQuizResults();
            results.push(result);

            const trimmedResults = results.slice(-50);
            localStorage.setItem(
                this.STORAGE_KEYS.QUIZ_RESULTS,
                JSON.stringify(trimmedResults)
            );

            await this.updateUserStats(result);
        } catch (error) {
            console.error("Error saving quiz result:", error);
        }
    }

    async getQuizResults(): Promise<QuizResult[]> {
        try {
            if (!this.isClient()) {
                console.warn(
                    "getQuizResults called on server-side, returning empty array"
                );
                return [];
            }
            const stored = localStorage.getItem(this.STORAGE_KEYS.QUIZ_RESULTS);
            if (!stored) return [];

            const results = JSON.parse(stored);
            return results.map((result: any) => ({
                ...result,
                completedAt: new Date(result.completedAt),
            }));
        } catch (error) {
            console.error("Error getting quiz results:", error);
            return [];
        }
    }

    async getRecentQuizResults(limit: number = 10): Promise<QuizResult[]> {
        const results = await this.getQuizResults();
        return results
            .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
            .slice(0, limit);
    }

    private async updateUserStats(quizResult: QuizResult): Promise<void> {
        try {
            if (!this.isClient()) {
                console.warn("updateUserStats called on server-side, skipping");
                return;
            }
            let profile = await this.getUserProfile("current_user");
            if (!profile) {
                profile = await this.createUserProfile({
                    uid: "current_user",
                    email: "user@example.com",
                    displayName: "User",
                });
            }

            const stats = profile.stats;

            stats.totalQuizzes += 1;
            stats.totalQuestions += quizResult.totalQuestions;
            stats.totalCorrect += quizResult.correctAnswers;
            stats.totalTimeSpent += quizResult.timeSpent;

            stats.averageScore = Math.round(
                (stats.totalCorrect / stats.totalQuestions) * 100
            );

            const today = new Date();
            const lastQuizDate = stats.lastQuizDate;

            if (lastQuizDate) {
                const daysDiff = Math.floor(
                    (today.getTime() - new Date(lastQuizDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                );
                if (daysDiff === 1) {
                    stats.streak += 1;
                    stats.longestStreak = Math.max(
                        stats.longestStreak,
                        stats.streak
                    );
                } else if (daysDiff > 1) {
                    stats.streak = 1;
                }
            } else {
                stats.streak = 1;
            }

            stats.lastQuizDate = today;

            const baseXP = quizResult.correctAnswers * 10;
            const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[
                quizResult.difficulty
            ];
            const xpGained = Math.floor(baseXP * difficultyMultiplier);

            stats.xp += xpGained;
            stats.level = Math.floor(stats.xp / 1000) + 1;

            // Check achievements
            stats.achievements.forEach((achievement) => {
                if (achievement.unlockedAt) return;

                switch (achievement.id) {
                    case "first_quiz":
                        if (stats.totalQuizzes >= 1) {
                            achievement.unlockedAt = new Date();
                            achievement.progress = 1;
                        }
                        break;
                    case "quiz_master":
                        achievement.progress = stats.totalQuizzes;
                        if (stats.totalQuizzes >= 10) {
                            achievement.unlockedAt = new Date();
                        }
                        break;
                    case "perfectionist":
                        if (quizResult.score === 100) {
                            achievement.unlockedAt = new Date();
                            achievement.progress = 1;
                        }
                        break;
                    case "speed_demon":
                        if (quizResult.timeSpent < 30) {
                            achievement.unlockedAt = new Date();
                            achievement.progress = 1;
                        }
                        break;
                    case "streak_keeper":
                        achievement.progress = stats.streak;
                        if (stats.streak >= 7) {
                            achievement.unlockedAt = new Date();
                        }
                        break;
                    case "knowledge_seeker":
                        achievement.progress = stats.totalCorrect;
                        if (stats.totalCorrect >= 100) {
                            achievement.unlockedAt = new Date();
                        }
                        break;
                }
            });

            await this.saveUserProfile(profile);
        } catch (error) {
            console.error("Error updating user stats:", error);
        }
    }

    async saveQuizSession(sessionData: QuizSession): Promise<void> {
        try {
            if (!this.isClient()) {
                console.warn("saveQuizSession called on server-side, skipping");
                return;
            }
            // Convert session data to QuizResult format for storage
            const quizResult: QuizResult = {
                id: `quiz_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                title: sessionData.title,
                topic: sessionData.topic,
                difficulty: sessionData.difficulty,
                score: sessionData.score,
                totalQuestions: sessionData.questionsCount,
                correctAnswers: sessionData.correctAnswers,
                timeSpent: sessionData.timeSpent,
                completedAt: sessionData.completedAt,
                questions: sessionData.questions.map((q) => q.question),
                userAnswers: sessionData.questions.map((q) => ({
                    selectedAnswer: q.userAnswer,
                    correctAnswer: q.correctAnswer,
                    isCorrect: q.isCorrect,
                    timeSpent: q.timeSpent,
                })),
            };

            // Save using existing method
            await this.saveQuizResult(quizResult);
        } catch (error) {
            console.error("Error saving quiz session:", error);
            throw error;
        }
    }

    async updateUserStreak(userId: string): Promise<void> {
        try {
            if (!this.isClient()) {
                console.warn(
                    "updateUserStreak called on server-side, skipping"
                );
                return;
            }
            let profile = await this.getUserProfile(userId);
            if (!profile) {
                profile = await this.createUserProfile({
                    uid: userId,
                    email: "user@example.com",
                    displayName: "User",
                });
            }

            const today = new Date();
            const lastQuizDate = profile.stats.lastQuizDate;

            if (lastQuizDate) {
                const lastDate = new Date(lastQuizDate);
                const daysDiff = Math.floor(
                    (today.getTime() - lastDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                );

                if (daysDiff === 1) {
                    // Consecutive day - extend streak
                    profile.stats.streak += 1;
                    profile.stats.longestStreak = Math.max(
                        profile.stats.longestStreak,
                        profile.stats.streak
                    );
                } else if (daysDiff > 1) {
                    // Gap in streak - reset to 1
                    profile.stats.streak = 1;
                } else if (daysDiff === 0) {
                    // Same day - don't change streak
                    // Streak stays the same
                }
            } else {
                // First quiz ever
                profile.stats.streak = 1;
            }

            // Update last quiz date
            profile.stats.lastQuizDate = today;

            // Update streak keeper achievement progress
            const streakAchievement = profile.stats.achievements.find(
                (a) => a.id === "streak_keeper"
            );
            if (streakAchievement && !streakAchievement.unlockedAt) {
                streakAchievement.progress = profile.stats.streak;
                if (profile.stats.streak >= 7) {
                    streakAchievement.unlockedAt = new Date();
                }
            }

            await this.saveUserProfile(profile);
        } catch (error) {
            console.error("Error updating user streak:", error);
            throw error;
        }
    }

    async clearAllData(): Promise<void> {
        if (!this.isClient()) {
            console.warn("clearAllData called on server-side, skipping");
            return;
        }
        Object.values(this.STORAGE_KEYS).forEach((key) => {
            localStorage.removeItem(key);
        });
    }
}

export const userDataService = new UserDataService();
