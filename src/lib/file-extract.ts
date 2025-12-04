// Utilities for server-side file text extraction and quiz cleanup
// Dynamic imports avoid init-time issues (e.g., pdf-parse fs reads)

export async function extractTextFromUpload(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const name = (file.name || "").toLowerCase();
    const mime = (file.type || "").toLowerCase();

    const hasExt = (ext: string) => name.endsWith(ext);

    try {
        if (mime === "application/pdf" || hasExt(".pdf")) {
            // Primary: pdf-parse (requested behavior)
            try {
                const mod: any = await import("pdf-parse/lib/pdf-parse.js");
                const pdf = (mod?.default ?? mod) as (
                    data: Buffer
                ) => Promise<{ text: string }>;
                const data = await pdf(buffer);
                const primary = (data?.text || "").trim();
                const words = primary.split(/\s+/).filter(Boolean);
                if (words.length >= 5) return primary;
            } catch {}

            // Fallback: pdfjs-dist if pdf-parse fails or returns very little
            try {
                async function loadPdfjs() {
                    try {
                        return await import("pdfjs-dist/legacy/build/pdf.js");
                    } catch {}
                    try {
                        return await import("pdfjs-dist/build/pdf.mjs");
                    } catch {}
                    return await import("pdfjs-dist");
                }
                const pdfjs: any = await loadPdfjs();
                const getDocument =
                    (pdfjs as any).getDocument ??
                    (pdfjs as any).default?.getDocument;
                const GlobalWorkerOptions =
                    (pdfjs as any).GlobalWorkerOptions ??
                    (pdfjs as any).default?.GlobalWorkerOptions;
                if (GlobalWorkerOptions)
                    GlobalWorkerOptions.workerSrc = undefined as any;
                const task = getDocument({ data: buffer });
                const doc = await task.promise;
                let out = "";
                for (let i = 1; i <= doc.numPages; i++) {
                    const page = await doc.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = (content.items || [])
                        .map((it: any) => it.str ?? it.text ?? "")
                        .join(" ");
                    out += pageText + "\n";
                }
                return out.trim();
            } catch {
                return "";
            }
        }

        if (
            mime ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            hasExt(".docx")
        ) {
            const JSZip = (await import("jszip")).default;
            const zip = await JSZip.loadAsync(buffer);
            const parts: string[] = [];
            const targets = Object.keys(zip.files).filter((p) =>
                /^(word\/document\.xml|word\/header\d*\.xml|word\/footer\d*\.xml)$/i.test(
                    p
                )
            );
            for (const p of targets) {
                const xml = await zip.file(p)!.async("string");
                const matches = xml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
                for (const m of matches) {
                    const t = m
                        .replace(/<\/?.*?>/g, "")
                        .replace(/&amp;/g, "&")
                        .replace(/&lt;/g, "<")
                        .replace(/&gt;/g, ">")
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/[\s\u00A0]+/g, " ")
                        .trim();
                    if (t) parts.push(t);
                }
            }
            return parts.join(" ").trim();
        }

        if (
            mime ===
                "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
            hasExt(".pptx")
        ) {
            const JSZip = (await import("jszip")).default;
            const zip = await JSZip.loadAsync(buffer);
            const slidePaths = Object.keys(zip.files)
                .filter(
                    (p) =>
                        p.startsWith("ppt/slides/slide") && p.endsWith(".xml")
                )
                .sort((a, b) => {
                    const na = parseInt(
                        a.match(/slide(\d+)\.xml$/)?.[1] || "0",
                        10
                    );
                    const nb = parseInt(
                        b.match(/slide(\d+)\.xml$/)?.[1] || "0",
                        10
                    );
                    return na - nb;
                });

            const parts: string[] = [];
            for (const p of slidePaths) {
                const xml = await zip.file(p)!.async("string");
                const matches = xml.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [];
                for (const m of matches) {
                    const t = m
                        .replace(/<\/?a:t>/g, "")
                        .replace(/\s+/g, " ")
                        .trim();
                    if (t) parts.push(t);
                }
            }
            return parts.join(" ").trim();
        }

        if (mime === "text/plain" || hasExt(".txt")) {
            return buffer.toString("utf-8").trim();
        }

        return "";
    } catch (e) {
        console.error("extractTextFromUpload error:", e);
        return "";
    }
}

function unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

function normalizeOption(text: string): string {
    return text
        .replace(/[\s\u00A0]+/g, " ")
        .replace(/^[\s,.;:!?-]+|[\s,.;:!?-]+$/g, "")
        .replace(/\s*[,;:]+\s*$/g, "")
        .trim();
}

function uniqueByNormalized(arr: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of arr) {
        const n = normalizeOption(s).toLowerCase();
        if (!n) continue;
        if (seen.has(n)) continue;
        seen.add(n);
        out.push(normalizeOption(s));
    }
    return out;
}

function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function sanitizeQuestions(
    qs: { question: string; answer: string; options?: string[] }[],
    want: number
) {
    return qs.slice(0, want).map((q) => {
        const cleanAnswer = normalizeOption(q.answer);
        let opts = uniqueByNormalized([...(q.options || []), cleanAnswer]);

        // Fill to 4 unique options with generic fillers if insufficient
        let fillerIdx = 1;
        while (opts.length < 4) {
            const filler = normalizeOption(`Option ${fillerIdx++}`);
            if (!opts.some((o) => o.toLowerCase() === filler.toLowerCase())) {
                opts.push(filler);
            }
        }

        // Ensure exactly 4, dedup again robustly, then shuffle
        opts = uniqueByNormalized(opts).slice(0, 4);
        opts = shuffle(opts);

        // Guarantee answer present exactly once
        if (!opts.some((o) => o.toLowerCase() === cleanAnswer.toLowerCase())) {
            opts[0] = cleanAnswer;
            opts = shuffle(opts);
        }

        // Clean question punctuation spacing
        const cleanQuestion = (q.question || "")
            .replace(/[\s\u00A0]+/g, " ")
            .replace(/\s*[,;:]+\s*\?/g, "?")
            .replace(/\s*\?\s*$/, "?")
            .trim();

        return {
            ...q,
            question: cleanQuestion,
            answer: cleanAnswer,
            options: opts,
        };
    });
}
