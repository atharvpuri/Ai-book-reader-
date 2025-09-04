export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export interface GeminiSettings {
  temperature: number;
  topP: number;
  topK: number;
}

declare global {
  interface Window {
    pdfjsLib: any;
    mammoth: any;
  }
}
