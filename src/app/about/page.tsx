import { BrainCircuit, Target, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            About helpmelearnthis
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your personal AI-powered learning assistant. We make learning more
            accessible, engaging, and effective for everyone.
          </p>
        </div>

        <div className="mt-20 grid gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Target className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">Our Mission</h2>
            <p className="mt-2 text-muted-foreground">
              To unlock human potential through personalized learning
              experiences. We believe that education should adapt to you, not
              the other way around.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Our platform uses cutting-edge AI to generate quizzes from any
              text-based content, adapting the difficulty to your performance.
              This creates a unique learning path for you.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">Who We Serve</h2>
            <p className="mt-2 text-muted-foreground">
              Students preparing for exams, professionals acquiring new
              skills, and lifelong learners exploring new subjects. Our tool is
              for anyone with a curiosity to learn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
