import { PdfReasoningGraph } from './langGraphApi';

// In-memory cache for PdfReasoningGraph instances
// In a production environment, replace this with a persistent storage solution (e.g., database)
const reasoningGraphs = new Map<string, PdfReasoningGraph>();

interface SendChatMessageParams {
  sessionId?: string;
  pdfContent: string;
  query: string;
}

interface SendChatMessageResponse {
  sessionId: string;
  answer: string;
}

export async function sendChatMessage({ sessionId, pdfContent, query }: SendChatMessageParams): Promise<SendChatMessageResponse> {
  let graph: PdfReasoningGraph;
  let currentSessionId = sessionId;

  if (currentSessionId && reasoningGraphs.has(currentSessionId)) {
    // Retrieve existing graph
    graph = reasoningGraphs.get(currentSessionId)!;
    // Ensure the PDF content matches the session's PDF content
    // In a real app, you might handle this differently (e.g., disallow changing PDF in a session)
    if (graph['pdfContent'] !== pdfContent) {
         // For this simple example, we'll just create a new session if PDF content changes
         graph = new PdfReasoningGraph(pdfContent);
         currentSessionId = graph.getSessionId(); // Get the new session ID
         reasoningGraphs.set(currentSessionId, graph);
    }
  } else {
    // Create a new graph
    if (!pdfContent) {
        throw new Error('pdfContent is required for a new session');
    }
    graph = new PdfReasoningGraph(pdfContent);
    currentSessionId = graph.getSessionId(); // Get the new session ID
    reasoningGraphs.set(currentSessionId, graph);
  }

  try {
    const answer = await graph.processQuery(query);
    return { sessionId: currentSessionId, answer };
  } catch (error) {
    console.error('Error processing query:', error);
    throw new Error(`Error processing query: ${error instanceof Error ? error.message : String(error)}`);
  }
}
