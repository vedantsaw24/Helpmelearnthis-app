"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LogoProps {
    className?: string;
}

export function HelpMeLearnThisLogo(props: LogoProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check initial theme
        const checkTheme = () => {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
        };

        checkTheme();

        // Watch for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    // Determine which logo to use based on dark mode
    const logoSrc = isDarkMode
        ? "/helpmelearnthis-black.png"
        : "/helpmelearnthis-white.png";

    return (
        <Link
            href="/"
            className={`flex items-center gap-2 ${props.className || ""}`}
        >
            <Image
                src={logoSrc}
                alt="helpmelearnthis logo"
                width={40}
                height={40}
                className="h-10 w-10"
                priority
            />
            <span className="text-xl font-bold tracking-tight">
                helpmelearnthis
            </span>
        </Link>
    );
}
