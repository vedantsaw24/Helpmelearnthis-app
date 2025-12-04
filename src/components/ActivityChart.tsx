"use client";

import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface ActivityChartProps {
    userId: string;
}

export default function ActivityChart({ userId }: ActivityChartProps) {
    // Simplified chart component to reduce loading time
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Activity Overview
                </CardTitle>
                <CardDescription>
                    Your learning progress this week
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                    📊 Activity chart will be displayed here
                </div>
            </CardContent>
        </Card>
    );
}
