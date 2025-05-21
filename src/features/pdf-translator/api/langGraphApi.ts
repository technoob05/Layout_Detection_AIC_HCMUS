import { v4 as uuidv4 } from 'uuid';
import { geminiApi } from './geminiApi';
import { PdfSource } from '../types';

// Since we're implementing LangGraph-like functionality without the actual backend,
// we'll simulate the graph flow with a state machine

interface QueryResult {
  response: string;
  sources?: PdfSource[];
}

// Graph for PDF reasoning
export class PdfReasoningGraph {
  private sessionId: string;
  private pdfContent: string;
  private memory: Map<string, any>; // For internal graph state/options
  private longTermMemory: Map<string, any>; // Simulated long-term storage
  
  constructor(pdfContent: string | any) {
    this.sessionId = uuidv4();
    // Ensure pdfContent is a string
    this.pdfContent = typeof pdfContent === 'string' ? pdfContent : JSON.stringify(pdfContent);
    this.memory = new Map();
    this.longTermMemory = new Map(); // Initialize long-term memory
    this.memory.set('context_retrieval_enabled', true);
    this.memory.set('reasoning_steps_enabled', true);
    this.memory.set('temperature', 0.7);
    this.memory.set('max_tokens', 1000);
    this.memory.set('conversation_style', 'balanced');
  }
  
  // Process a query through our simulated LangGraph
  async processQuery(query: string): Promise<string> {
    const result = await this.processQueryWithSources(query, false);
    return result.response;
  }

  // Process a query and return both response and sources
  async processQueryWithSources(query: string, includeCitations: boolean = true): Promise<QueryResult> {
    try {
      // Step 1: Context retrieval (identify relevant parts of the PDF)
      const relevantContextResult = await this.retrieveContextWithSources(query);
      const relevantContext = relevantContextResult.context;
      const sources = relevantContextResult.sources;
      
      // Step 2: Planning (determine how to approach answering)
      const plan = await this.createPlan(query, relevantContext);
      
      // Step 3: Reasoning (execute the plan with step-by-step reasoning)
      const reasoning = await this.executeReasoning(query, plan, relevantContext);
      
      // Step 4: Final answer generation
      const answer = await this.generateAnswer(query, reasoning, includeCitations ? sources : []);
      
      return {
        response: answer,
        sources: includeCitations ? sources : undefined
      };
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        response: "I apologize, but I encountered an error while processing your question. Please try again."
      };
    }
  }
  
  // Safely get a substring of pdfContent with error handling
  private safeSubstring(start: number, end?: number): string {
    try {
      if (typeof this.pdfContent !== 'string') {
        console.error('pdfContent is not a string:', typeof this.pdfContent);
        return String(this.pdfContent).substring(0, 1000);
      }
      return this.pdfContent.substring(start, end);
    } catch (error) {
      console.error('Error getting substring:', error);
      return "Error: Could not process PDF content";
    }
  }
  
  // Simulate context retrieval using the Gemini API with source tracking
  private async retrieveContextWithSources(query: string): Promise<{ context: string, sources: PdfSource[] }> {
    if (!this.memory.get('context_retrieval_enabled')) {
      return { 
        context: this.pdfContent,
        sources: []
      }; // Return the full PDF content if retrieval is disabled
    }
    
    const prompt = `
    You are a context retrieval system.
    
    PDF CONTENT:
    ${this.pdfContent}
    
    USER QUERY: ${query}
    
    TASK: Identify and extract the most relevant sections of the PDF content that would help answer the user's query.
    For each section you extract, provide:
    1. The exact text from the PDF
    2. An estimate of which page it's from (guess if you're not sure)
    3. A confidence score (0-100) for how relevant this section is to the query
    
    FORMAT YOUR RESPONSE AS A JSON ARRAY:
    [
      {
        "text": "The exact text from the PDF",
        "page": 1,
        "confidence": 95
      },
      ...
    ]
    
    Return only the most relevant sections, limited to 3-5 sections maximum. If the query isn't related to the PDF content,
    return an empty array [].
    `;
    
    try {
      const result = await geminiApi.generateText(prompt, { temperature: 0.1 });
      
      // Parse the JSON sources
      let sources: PdfSource[] = [];
      try {
        const jsonResult = result.trim().replace(/```json|```/g, '');
        sources = JSON.parse(jsonResult);
        
        // Validate the sources
        sources = sources.filter(source => 
          source.text && 
          typeof source.text === 'string' && 
          typeof source.page === 'number' && 
          typeof source.confidence === 'number'
        );
      } catch (e) {
        console.error('Error parsing sources JSON:', e);
        sources = [];
      }
      
      // Extract the text from the sources for context
      const context = sources.map(source => source.text).join('\n\n');
      
      return {
        context: context || this.safeSubstring(0, 5000), // Fallback to first 5000 chars if no context
        sources
      };
    } catch (error) {
      console.error('Error in context retrieval:', error);
      return {
        context: this.safeSubstring(0, 5000),
        sources: []
      };
    }
  }
  
  // Simulate planning step
  private async createPlan(query: string, context: string): Promise<string> {
    const prompt = `
    You are a planning system for answering questions about PDF documents.
    
    RELEVANT PDF CONTENT:
    ${context}
    
    USER QUERY: ${query}
    
    TASK: Create a step-by-step plan for answering the user's query based on the provided context.
    Your plan should include:
    1. What information from the PDF is needed
    2. How to organize the answer
    3. Whether any calculations or logical reasoning are required
    4. How to present the conclusion
    
    Keep your plan concise, focusing on the key steps needed to answer the query accurately.
    `;
    
    try {
      const result = await geminiApi.generateText(prompt, { temperature: 0.2 });
      return result;
    } catch (error) {
      console.error('Error in plan creation:', error);
      return "1. Extract key facts from PDF\n2. Synthesize information\n3. Present answer clearly";
    }
  }
  
  // Simulate reasoning step
  private async executeReasoning(query: string, plan: string, context: string): Promise<string> {
    if (!this.memory.get('reasoning_steps_enabled')) {
      return context; // Skip reasoning if disabled
    }
    
    const prompt = `
    You are a reasoning system that analyzes PDF content to answer questions.
    
    RELEVANT PDF CONTENT:
    ${context}
    
    PLAN:
    ${plan}
    
    USER QUERY: ${query}
    
    TASK: Follow the plan and reason step-by-step to answer the query. Show your work clearly:
    - Identify the key facts from the PDF content relevant to the query
    - Apply logical reasoning to analyze these facts
    - Provide intermediate conclusions as you reason through the problem
    - Note any missing information that would be helpful
    
    Your reasoning should be detailed, logical, and clearly connected to the PDF content.
    `;
    
    try {
      const result = await geminiApi.generateText(prompt, { temperature: 0.3 });
      return result;
    } catch (error) {
      console.error('Error in reasoning:', error);
      return "Unable to perform detailed reasoning due to an error. Proceeding with direct answer.";
    }
  }
  
  // Generate final answer with sources
  private async generateAnswer(query: string, reasoning: string, sources: PdfSource[]): Promise<string> {
    const includeCitations = sources.length > 0;
    const sourceText = includeCitations 
      ? `SOURCES FROM PDF:
${sources.map((s, i) => `[${i + 1}] Page ${s.page}: "${s.text.substring(0, 100)}${s.text.length > 100 ? '...' : ''}"`).join('\n')}`
      : '';
      
    const citationInstructions = includeCitations
      ? `If you reference specific information from the PDF, cite the source using [1], [2], etc. corresponding to the source numbers provided above.`
      : '';
    
    const prompt = `
    You are a helpful assistant that answers questions about PDF documents.
    
    ${sourceText}
    
    DETAILED REASONING:
    ${reasoning}
    
    USER QUERY: ${query}
    
    TASK: Based on the reasoning above, provide a clear, concise, and accurate answer to the user's query.
    The answer should be helpful, informative, and directly address what the user asked.
    If the reasoning process found that the PDF doesn't contain relevant information, politely inform the user.
    
    ${citationInstructions}
    
    Your answer should be in a conversational tone, as if you're directly speaking to the user.
    `;
    
    try {
      const temperature = this.memory.get('temperature') || 0.4;
      const conversationStyle = this.memory.get('conversation_style') || 'balanced';
      
      // Adjust temperature based on conversation style
      let adjustedTemperature = temperature;
      if (conversationStyle === 'creative') {
        adjustedTemperature = Math.min(1.0, temperature + 0.3);
      } else if (conversationStyle === 'concise') {
        adjustedTemperature = Math.max(0.1, temperature - 0.3);
      }
      
      const result = await geminiApi.generateText(prompt, { 
        temperature: adjustedTemperature,
        maxOutputTokens: this.memory.get('max_tokens') || 1000
      });
      
      return result;
    } catch (error) {
      console.error('Error in answer generation:', error);
      return "I apologize, but I encountered an error while analyzing the PDF. Please try asking again with a different question.";
    }
  }
  
  // Configure graph options
  setOption(key: string, value: any): void {
    this.memory.set(key, value);
  }
  
  // Get current session ID
  getSessionId(): string {
    return this.sessionId;
  }
}

// Export a function to create a new PDF reasoning graph
export function createPdfReasoningGraph(pdfContent: string | any): PdfReasoningGraph {
  return new PdfReasoningGraph(pdfContent);
}
