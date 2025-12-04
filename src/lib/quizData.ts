export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    difficulty: "easy" | "medium" | "hard";
    timeLimit?: number; // in seconds
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    difficulty: "easy" | "medium" | "hard";
    estimatedTime: number; // in minutes
    questions: QuizQuestion[];
    tags: string[];
    popularity: number;
    icon: string;
}

export const techQuizzes: Quiz[] = [
    {
        id: "javascript-fundamentals",
        title: "JavaScript Fundamentals",
        description:
            "Test your knowledge of JavaScript basics including variables, functions, and control flow.",
        category: "technology",
        subcategory: "web-development",
        difficulty: "easy",
        estimatedTime: 15,
        popularity: 95,
        icon: "🟨",
        tags: ["javascript", "programming", "web-development", "frontend"],
        questions: [
            {
                id: "js1",
                question:
                    "Which of the following is the correct way to declare a variable in JavaScript?",
                options: [
                    "var myVariable;",
                    "variable myVariable;",
                    "declare myVariable;",
                    "let myVariable;",
                ],
                correctAnswer: "var myVariable;",
                explanation:
                    "In JavaScript, variables can be declared using 'var', 'let', or 'const' keywords.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "js2",
                question: "What does '===' operator do in JavaScript?",
                options: [
                    "Checks for equality without type coercion",
                    "Assigns a value",
                    "Checks for inequality",
                    "Performs addition",
                ],
                correctAnswer: "Checks for equality without type coercion",
                explanation:
                    "The '===' operator checks for strict equality, comparing both value and type.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "js3",
                question:
                    "Which method is used to add an element to the end of an array?",
                options: ["push()", "add()", "append()", "insert()"],
                correctAnswer: "push()",
                explanation:
                    "The push() method adds one or more elements to the end of an array.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "js4",
                question: "What is the result of typeof null in JavaScript?",
                options: ["null", "undefined", "object", "boolean"],
                correctAnswer: "object",
                explanation:
                    "This is a known quirk in JavaScript where typeof null returns 'object'.",
                difficulty: "medium",
                timeLimit: 30,
            },
            {
                id: "js5",
                question:
                    "Which of the following is NOT a primitive data type in JavaScript?",
                options: ["string", "number", "array", "boolean"],
                correctAnswer: "array",
                explanation:
                    "Arrays are objects in JavaScript, not primitive data types.",
                difficulty: "easy",
                timeLimit: 30,
            },
        ],
    },
    {
        id: "react-hooks",
        title: "React Hooks Mastery",
        description:
            "Advanced React Hooks concepts including useState, useEffect, useContext, and custom hooks.",
        category: "technology",
        subcategory: "frontend",
        difficulty: "medium",
        estimatedTime: 20,
        popularity: 88,
        icon: "⚛️",
        tags: ["react", "hooks", "frontend", "components"],
        questions: [
            {
                id: "react1",
                question: "When does useEffect run by default?",
                options: [
                    "Only on mount",
                    "After every render",
                    "Only on unmount",
                    "Only when state changes",
                ],
                correctAnswer: "After every render",
                explanation:
                    "useEffect runs after every completed render by default.",
                difficulty: "medium",
                timeLimit: 45,
            },
            {
                id: "react2",
                question:
                    "How do you prevent useEffect from running on every render?",
                options: [
                    "Use a dependency array",
                    "Use useCallback",
                    "Use useMemo",
                    "Use useState",
                ],
                correctAnswer: "Use a dependency array",
                explanation:
                    "The dependency array controls when useEffect runs.",
                difficulty: "medium",
                timeLimit: 45,
            },
            {
                id: "react3",
                question: "What does useState return?",
                options: [
                    "A single value",
                    "An array with state and setter",
                    "An object",
                    "A function",
                ],
                correctAnswer: "An array with state and setter",
                explanation:
                    "useState returns an array with the current state value and a setter function.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "react4",
                question:
                    "Which hook is used for performance optimization of expensive calculations?",
                options: ["useEffect", "useState", "useMemo", "useContext"],
                correctAnswer: "useMemo",
                explanation:
                    "useMemo memoizes expensive calculations and only recalculates when dependencies change.",
                difficulty: "medium",
                timeLimit: 45,
            },
            {
                id: "react5",
                question: "What is the purpose of useCallback?",
                options: [
                    "To memoize values",
                    "To memoize functions",
                    "To handle side effects",
                    "To manage state",
                ],
                correctAnswer: "To memoize functions",
                explanation:
                    "useCallback memoizes functions to prevent unnecessary re-renders of child components.",
                difficulty: "medium",
                timeLimit: 45,
            },
        ],
    },
    {
        id: "python-basics",
        title: "Python Programming Basics",
        description:
            "Fundamental Python concepts including data types, control structures, and functions.",
        category: "technology",
        subcategory: "programming",
        difficulty: "easy",
        estimatedTime: 18,
        popularity: 92,
        icon: "🐍",
        tags: ["python", "programming", "backend", "data-science"],
        questions: [
            {
                id: "py1",
                question:
                    "Which of the following is the correct way to define a function in Python?",
                options: [
                    "function myFunc():",
                    "def myFunc():",
                    "func myFunc():",
                    "define myFunc():",
                ],
                correctAnswer: "def myFunc():",
                explanation:
                    "Functions in Python are defined using the 'def' keyword.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "py2",
                question: "What is the output of print(type([]))?",
                options: [
                    "<class 'array'>",
                    "<class 'list'>",
                    "<class 'tuple'>",
                    "<class 'dict'>",
                ],
                correctAnswer: "<class 'list'>",
                explanation: "Square brackets [] create a list in Python.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "py3",
                question:
                    "Which operator is used for exponentiation in Python?",
                options: ["^", "**", "exp", "pow"],
                correctAnswer: "**",
                explanation:
                    "The ** operator is used for exponentiation in Python.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "py4",
                question: "What does the 'len()' function return for a string?",
                options: [
                    "The memory size",
                    "The number of characters",
                    "The number of words",
                    "The encoding type",
                ],
                correctAnswer: "The number of characters",
                explanation:
                    "len() returns the number of characters in a string.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "py5",
                question:
                    "Which of the following is a mutable data type in Python?",
                options: ["tuple", "string", "list", "int"],
                correctAnswer: "list",
                explanation:
                    "Lists are mutable in Python, meaning they can be modified after creation.",
                difficulty: "easy",
                timeLimit: 30,
            },
        ],
    },
    {
        id: "nodejs-express",
        title: "Node.js & Express.js",
        description:
            "Backend development with Node.js and Express framework concepts.",
        category: "technology",
        subcategory: "backend",
        difficulty: "medium",
        estimatedTime: 25,
        popularity: 85,
        icon: "🟢",
        tags: ["nodejs", "express", "backend", "api"],
        questions: [
            {
                id: "node1",
                question: "What is Node.js?",
                options: [
                    "A JavaScript library",
                    "A JavaScript runtime",
                    "A web browser",
                    "A database",
                ],
                correctAnswer: "A JavaScript runtime",
                explanation:
                    "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "node2",
                question:
                    "Which method is used to create a basic Express server?",
                options: [
                    "express.server()",
                    "express.create()",
                    "express()",
                    "new Express()",
                ],
                correctAnswer: "express()",
                explanation:
                    "You create an Express application by calling the express() function.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "node3",
                question: "What does 'npm' stand for?",
                options: [
                    "Node Package Manager",
                    "New Package Manager",
                    "Node Program Manager",
                    "Network Package Manager",
                ],
                correctAnswer: "Node Package Manager",
                explanation: "npm is the Node Package Manager for JavaScript.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "node4",
                question:
                    "Which Express method is used to handle POST requests?",
                options: [
                    "app.post()",
                    "app.get()",
                    "app.put()",
                    "app.request()",
                ],
                correctAnswer: "app.post()",
                explanation:
                    "app.post() is used to handle HTTP POST requests in Express.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "node5",
                question: "What is middleware in Express?",
                options: [
                    "Database connections",
                    "Functions that execute during request-response cycle",
                    "HTML templates",
                    "CSS files",
                ],
                correctAnswer:
                    "Functions that execute during request-response cycle",
                explanation:
                    "Middleware functions have access to request, response objects and can modify them.",
                difficulty: "medium",
                timeLimit: 45,
            },
        ],
    },
    {
        id: "database-sql",
        title: "SQL Database Fundamentals",
        description:
            "Essential SQL concepts including queries, joins, and database design.",
        category: "technology",
        subcategory: "database",
        difficulty: "medium",
        estimatedTime: 22,
        popularity: 80,
        icon: "🗄️",
        tags: ["sql", "database", "queries", "data"],
        questions: [
            {
                id: "sql1",
                question:
                    "Which SQL statement is used to retrieve data from a database?",
                options: ["GET", "SELECT", "RETRIEVE", "FETCH"],
                correctAnswer: "SELECT",
                explanation:
                    "SELECT is the SQL statement used to query and retrieve data from a database.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "sql2",
                question: "What does SQL stand for?",
                options: [
                    "Structured Query Language",
                    "Simple Query Language",
                    "Standard Query Language",
                    "Sequential Query Language",
                ],
                correctAnswer: "Structured Query Language",
                explanation: "SQL stands for Structured Query Language.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "sql3",
                question: "Which JOIN returns all records from both tables?",
                options: [
                    "INNER JOIN",
                    "LEFT JOIN",
                    "RIGHT JOIN",
                    "FULL OUTER JOIN",
                ],
                correctAnswer: "FULL OUTER JOIN",
                explanation:
                    "FULL OUTER JOIN returns all records from both tables, including unmatched records.",
                difficulty: "medium",
                timeLimit: 45,
            },
            {
                id: "sql4",
                question: "Which clause is used to filter records in SQL?",
                options: ["FILTER", "WHERE", "HAVING", "IF"],
                correctAnswer: "WHERE",
                explanation:
                    "The WHERE clause is used to filter records based on specified conditions.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "sql5",
                question: "What is a primary key?",
                options: [
                    "A key that opens the database",
                    "A unique identifier for each record",
                    "The first column in a table",
                    "A password",
                ],
                correctAnswer: "A unique identifier for each record",
                explanation:
                    "A primary key uniquely identifies each record in a database table.",
                difficulty: "easy",
                timeLimit: 30,
            },
        ],
    },
    {
        id: "git-version-control",
        title: "Git Version Control",
        description:
            "Essential Git commands and version control concepts for developers.",
        category: "technology",
        subcategory: "tools",
        difficulty: "easy",
        estimatedTime: 15,
        popularity: 90,
        icon: "📝",
        tags: ["git", "version-control", "collaboration", "development"],
        questions: [
            {
                id: "git1",
                question:
                    "Which command is used to initialize a new Git repository?",
                options: ["git start", "git init", "git new", "git create"],
                correctAnswer: "git init",
                explanation:
                    "git init initializes a new Git repository in the current directory.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "git2",
                question: "What does 'git add .' do?",
                options: [
                    "Adds a new file",
                    "Stages all changes",
                    "Commits changes",
                    "Creates a branch",
                ],
                correctAnswer: "Stages all changes",
                explanation:
                    "git add . stages all changes in the current directory for the next commit.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "git3",
                question:
                    "Which command shows the current status of the repository?",
                options: ["git info", "git status", "git show", "git state"],
                correctAnswer: "git status",
                explanation:
                    "git status shows the current state of the working directory and staging area.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "git4",
                question: "What is a Git branch?",
                options: [
                    "A tree structure",
                    "A parallel version of the repository",
                    "A commit message",
                    "A file type",
                ],
                correctAnswer: "A parallel version of the repository",
                explanation:
                    "A Git branch is a parallel version that allows you to work on features independently.",
                difficulty: "easy",
                timeLimit: 30,
            },
            {
                id: "git5",
                question: "Which command is used to merge branches?",
                options: ["git combine", "git merge", "git join", "git unite"],
                correctAnswer: "git merge",
                explanation:
                    "git merge combines changes from one branch into another.",
                difficulty: "easy",
                timeLimit: 30,
            },
        ],
    },
];

export const getQuizById = (id: string): Quiz | undefined => {
    return techQuizzes.find((quiz) => quiz.id === id);
};

export const getQuizzesByCategory = (category: string): Quiz[] => {
    if (category === "all") return techQuizzes;
    return techQuizzes.filter((quiz) => quiz.category === category);
};

export const getQuizzesByDifficulty = (difficulty: string): Quiz[] => {
    if (difficulty === "all") return techQuizzes;
    return techQuizzes.filter((quiz) => quiz.difficulty === difficulty);
};

export const searchQuizzes = (searchTerm: string): Quiz[] => {
    const term = searchTerm.toLowerCase();
    return techQuizzes.filter(
        (quiz) =>
            quiz.title.toLowerCase().includes(term) ||
            quiz.description.toLowerCase().includes(term) ||
            quiz.tags.some((tag) => tag.toLowerCase().includes(term))
    );
};
