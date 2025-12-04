"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { HelpMeLearnThisLogo } from "@/components/adaptiquiz-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "./ui/sheet";
import {
    Menu,
    UserCircle,
    Home,
    Info,
    FileText,
    User,
    Settings,
    LogOut,
    BookOpen,
    BarChart3,
    Palette,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

export function Header() {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Home", icon: Home },
        { href: "/topics", label: "Topics", icon: BookOpen },
        { href: "/progress", label: "Progress", icon: BarChart3 },
        { href: "/about", label: "About", icon: Info },
        { href: "/policy", label: "Policy", icon: FileText },
    ];

    const userNavLinks = [
        { href: "/profile", label: "Profile", icon: User },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            setIsSheetOpen(false); // Close sidebar on logout
            toast({
                title: "Success",
                description: "Logged out successfully",
            });
            router.push("/login");
        } catch (error: any) {
            console.error("Logout error:", error);
            toast({
                title: "Error",
                description: "Failed to log out",
                variant: "destructive",
            });
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                {/* Logo - always visible */}
                <div className="flex-1 md:flex-none">
                    <HelpMeLearnThisLogo />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex flex-1 items-center justify-end">
                    <nav className="flex items-center gap-6 text-sm">
                        {user &&
                            navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="font-medium text-foreground/60 transition-colors hover:text-foreground/80"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        {!user && (
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full hover:rounded-md transition-all duration-300"
                            >
                                <Link href={"/login"}>Get Started</Link>
                            </Button>
                        )}
                    </nav>
                    <div className="flex items-center gap-2 ml-6">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <UserCircle className="h-6 w-6" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                        My Account
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => router.push("/profile")}
                                    >
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push("/settings")}
                                    >
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                        <ThemeToggle />
                    </div>
                </div>

                {/* Mobile Sidebar Button - positioned on the right */}
                <div className="md:hidden">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[300px] sm:w-[400px]"
                        >
                            <SheetHeader className="mb-6">
                                <SheetTitle className="text-left">
                                    <HelpMeLearnThisLogo />
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-2">
                                {/* Main Navigation */}
                                {user &&
                                    navLinks.map((link) => {
                                        const IconComponent = link.icon;
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() =>
                                                    setIsSheetOpen(false)
                                                }
                                                className="flex items-center gap-3 px-3 py-2 text-lg rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                            >
                                                <IconComponent className="h-5 w-5" />
                                                {link.label}
                                            </Link>
                                        );
                                    })}

                                {user && (
                                    <>
                                        <Separator className="my-4" />

                                        {/* User Account Section */}
                                        <div className="mb-2">
                                            <p className="text-sm font-medium text-muted-foreground px-3 py-1">
                                                Account
                                            </p>
                                        </div>

                                        {userNavLinks.map((link) => {
                                            const IconComponent = link.icon;
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() =>
                                                        setIsSheetOpen(false)
                                                    }
                                                    className="flex items-center gap-3 px-3 py-2 text-lg rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                                >
                                                    <IconComponent className="h-5 w-5" />
                                                    {link.label}
                                                </Link>
                                            );
                                        })}

                                        <Button
                                            variant="ghost"
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-3 py-2 text-lg justify-start h-auto font-normal hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            Log out
                                        </Button>
                                    </>
                                )}

                                {!user && (
                                    <>
                                        <Separator className="my-4" />
                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full"
                                            onClick={() =>
                                                setIsSheetOpen(false)
                                            }
                                        >
                                            <Link href="/login">
                                                Get Started
                                            </Link>
                                        </Button>
                                    </>
                                )}

                                {/* Theme Toggle Section */}
                                <Separator className="my-4" />
                                <div className="mb-2">
                                    <p className="text-sm font-medium text-muted-foreground px-3 py-1">
                                        Preferences
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <Palette className="h-5 w-5" />
                                    <span className="text-lg">Theme</span>
                                    <div className="ml-auto">
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
