"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
    Settings, 
    Bell, 
    Shield, 
    User, 
    Palette, 
    Volume2,
    Save
} from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    // Simplified local state management
    const [settings, setSettings] = useState({
        displayName: user?.displayName || "",
        email: user?.email || "",
        notifications: true,
        emailNotifications: false,
        soundEffects: true,
        theme: "system",
        difficulty: "medium",
        autoSubmit: false,
        showExplanations: true,
        language: "en"
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        
        // Simulate saving to localStorage or a simple API
        try {
            localStorage.setItem('userSettings', JSON.stringify(settings));
            
            setTimeout(() => {
                toast({
                    title: "Settings saved",
                    description: "Your preferences have been updated successfully.",
                });
                setSaving(false);
            }, 1000);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save settings. Please try again.",
            });
            setSaving(false);
        }
    };

    const updateSetting = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account preferences and quiz settings
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Profile Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile
                            </CardTitle>
                            <CardDescription>
                                Update your personal information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName">Display Name</Label>
                                    <Input
                                        id="displayName"
                                        value={settings.displayName}
                                        onChange={(e) => updateSetting('displayName', e.target.value)}
                                        placeholder="Your display name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={settings.email}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quiz Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Quiz Preferences
                            </CardTitle>
                            <CardDescription>
                                Customize your quiz experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="difficulty">Default Difficulty</Label>
                                    <Select 
                                        value={settings.difficulty} 
                                        onValueChange={(value) => updateSetting('difficulty', value)}
                                    >
                                        <SelectTrigger id="difficulty">
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <Select 
                                        value={settings.language} 
                                        onValueChange={(value) => updateSetting('language', value)}
                                    >
                                        <SelectTrigger id="language">
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="de">German</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="autoSubmit">Auto-submit answers</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically submit answers after selection
                                        </p>
                                    </div>
                                    <Switch
                                        id="autoSubmit"
                                        checked={settings.autoSubmit}
                                        onCheckedChange={(checked) => updateSetting('autoSubmit', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="showExplanations">Show explanations</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Display answer explanations after each question
                                        </p>
                                    </div>
                                    <Switch
                                        id="showExplanations"
                                        checked={settings.showExplanations}
                                        onCheckedChange={(checked) => updateSetting('showExplanations', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Appearance
                            </CardTitle>
                            <CardDescription>
                                Customize the look and feel
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="theme">Theme</Label>
                                    <Select 
                                        value={settings.theme} 
                                        onValueChange={(value) => updateSetting('theme', value)}
                                    >
                                        <SelectTrigger id="theme" className="w-full sm:w-48">
                                            <SelectValue placeholder="Select theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="system">System</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="soundEffects">Sound effects</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Play sounds for interactions and feedback
                                        </p>
                                    </div>
                                    <Switch
                                        id="soundEffects"
                                        checked={settings.soundEffects}
                                        onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription>
                                Manage how you receive updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="notifications">Push notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive browser notifications for updates
                                        </p>
                                    </div>
                                    <Switch
                                        id="notifications"
                                        checked={settings.notifications}
                                        onCheckedChange={(checked) => updateSetting('notifications', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="emailNotifications">Email notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive updates via email
                                        </p>
                                    </div>
                                    <Switch
                                        id="emailNotifications"
                                        checked={settings.emailNotifications}
                                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="w-full sm:w-auto min-w-32"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}