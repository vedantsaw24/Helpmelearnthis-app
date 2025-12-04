"use client";

import React, { useRef } from "react";
import { useFormStatus } from "react-dom";
import { UploadCloud, LoaderCircle, Wand2 } from "lucide-react";

import { generateQuizAction } from "@/app/actions";
import type { Question, Difficulty, QuizType } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";

interface ContentSetupProps {
    onQuizStart: (
        questions: Question[],
        difficulty: Difficulty,
        quizType: QuizType
    ) => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} size="lg" className="w-full">
            {pending ? (
                <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                </>
            ) : (
                <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Start Quiz
                </>
            )}
        </Button>
    );
}

export function ContentSetup({ onQuizStart }: ContentSetupProps) {
    const { toast } = useToast();
    const [numQuestions, setNumQuestions] = React.useState(5);
    const [fileName, setFileName] = React.useState("");
    const formRef = useRef<HTMLFormElement>(null);

    const initialState = { type: "", message: "" } as any;
    const [state, dispatch] = React.useActionState<any, FormData>(
        generateQuizAction as unknown as (state: any, payload: FormData) => any,
        initialState
    );

    React.useEffect(() => {
        if (state.type === "error") {
            toast({
                variant: "destructive",
                title: "Error",
                description: state.message,
            });
        } else if (state.type === "success" && state.questions) {
            const formData = new FormData(formRef.current!);
            const difficulty = formData.get("difficulty") as Difficulty;
            onQuizStart(state.questions, difficulty, "mcq");
        }
    }, [state, onQuizStart, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName("");
        }
    };

    return (
        <Card className="max-w-2xl mx-auto animate-fade-in">
            <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">
                    Create Your Quiz
                </CardTitle>
                <CardDescription>
                    Provide content and set your preferences to start a new
                    multiple-choice quiz.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={dispatch} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="content">Paste Your Content</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder="Paste any text here to generate a quiz from it. The more text you provide, the better the quiz will be."
                            rows={8}
                            className="max-h-72"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file-upload">Or Upload a File</Label>
                        <div className="relative">
                            <input
                                type="file"
                                name="file"
                                id="file-upload"
                                className="sr-only"
                                accept=".txt,.pdf,.docx,.pptx"
                                onChange={handleFileChange}
                                placeholder="Upload a file"
                            />
                            <Label
                                htmlFor="file-upload"
                                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-background hover:bg-muted/50"
                            >
                                <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">
                                    {fileName ||
                                        "Click to upload or drag and drop"}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    TXT, PDF, DOCX, or PPTX files
                                </p>
                            </Label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select name="difficulty" defaultValue="medium">
                                <SelectTrigger id="difficulty">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">
                                        Medium
                                    </SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numQuestions">
                                Number of Questions: {numQuestions}
                            </Label>
                            <Slider
                                id="numQuestions"
                                name="numQuestions"
                                min={1}
                                max={10}
                                step={1}
                                value={[numQuestions]}
                                onValueChange={(value) =>
                                    setNumQuestions(value[0])
                                }
                            />
                        </div>
                    </div>

                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
