export default function PolicyPage() {
    return (
        <div className="bg-background text-foreground">
            <div className="container mx-auto max-w-3xl px-4 py-16">
                <div className="prose prose-lg dark:prose-invert mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                            Privacy Policy
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Last updated: July 26, 2024
                        </p>
                    </div>

                    <p>
                        Your privacy is important to us. It is helpmelearnthis's
                        policy to respect your privacy regarding any information
                        we may collect from you across our website.
                    </p>

                    <h2 className="text-3xl font-bold mt-8">
                        1. Information We Collect
                    </h2>
                    <p>
                        When you use our service, you may provide us with text
                        content to generate quizzes. We process this content to
                        create questions and answers. We do not store your
                        content or the generated quizzes after your session is
                        complete. Any uploaded documents are processed in memory
                        and discarded immediately after quiz generation.
                    </p>

                    <h2 className="text-3xl font-bold mt-8">
                        2. How We Use Information
                    </h2>
                    <p>
                        The content you provide is used solely for the purpose
                        of generating a quiz for you. We do not use this
                        information for any other purpose, such as model
                        training, and we do not share it with third parties.
                    </p>

                    <h2 className="text-3xl font-bold mt-8">
                        3. Local Storage
                    </h2>
                    <p>
                        We use browser local storage to save your UI preferences
                        (theme, sidebar state) locally on your device. This data
                        is not sent to our servers and remains on your device to
                        provide a consistent user experience. We also use secure
                        session management for authentication.
                    </p>

                    <h2 className="text-3xl font-bold mt-8">
                        4. Data Security
                    </h2>
                    <p>
                        We take reasonable measures to protect the information
                        you provide from loss, theft, misuse, and unauthorized
                        access. All data transmission is encrypted using
                        SSL/TLS.
                    </p>

                    <h2 className="text-3xl font-bold mt-8">
                        5. Third-Party Services
                    </h2>
                    <p>
                        We use Google's Generative AI models to create quizzes.
                        Your content is sent to their API for processing and is
                        subject to their privacy policies. We do not permit them
                        to use your data for their model training.
                    </p>

                    <h2 className="text-3xl font-bold mt-8">
                        6. Changes to This Policy
                    </h2>
                    <p>
                        We may update this privacy policy from time to time. We
                        will notify you of any changes by posting the new
                        privacy policy on this page. You are advised to review
                        this Privacy Policy periodically for any changes.
                    </p>

                    <h2 className="text-3xl font-bold mt-8">7. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy,
                        please contact us by email at
                        policy@helpmelearnthis.com.
                    </p>
                </div>
            </div>
        </div>
    );
}
