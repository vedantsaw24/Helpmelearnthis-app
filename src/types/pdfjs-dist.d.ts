declare module "pdfjs-dist/legacy/build/pdf.js" {
    export const GlobalWorkerOptions: any;
    export function getDocument(params: any): { promise: Promise<any> };
}

declare module "pdfjs-dist/build/pdf.mjs" {
    export const GlobalWorkerOptions: any;
    export function getDocument(params: any): { promise: Promise<any> };
}
