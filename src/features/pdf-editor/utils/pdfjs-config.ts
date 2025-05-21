import { GlobalWorkerOptions } from 'pdfjs-dist';

// Set the worker source: use the local copy in public/pdf-worker
// This needs to be an absolute URL for the worker to load properly
const WORKER_URL = new URL('/pdf-worker/pdf.worker.min.js', window.location.origin).href;

/**
 * Initialize PDF.js configuration
 * This must be called before any PDF.js operations are performed
 */
export function initPdfJsConfig() {
  // Set the worker source
  GlobalWorkerOptions.workerSrc = WORKER_URL;
} 