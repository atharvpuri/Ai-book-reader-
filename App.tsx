import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { analyzeBookContent } from './services/geminiService';
import type { Message, GeminiSettings } from './types';

// Large content warning threshold (in characters). 
// gemini-2.5-flash has a large context window, but we set a reasonable limit for frontend performance and API stability.
const CONTENT_WARNING_THRESHOLD = 750000; 

const parsePdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  return fullText;
};

const parseDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value;
};


const App: React.FC = () => {
  const [bookContent, setBookContent] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<GeminiSettings>({
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
  });

  const handleBookUpload = (content: string, fileName: string) => {
    setBookContent(content);
    setBookTitle(fileName);
    
    let initialMessage = `Successfully loaded "${fileName}". I'm ready to answer your questions about the book.`;
    if (content.length > CONTENT_WARNING_THRESHOLD) {
      initialMessage += `\n\n**Warning:** This book is very large. The AI's analysis might be incomplete or miss details due to processing limits.`;
    }

    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: initialMessage,
      },
    ]);
    setError(null);
  };

  const handleFileSelect = async (file: File) => {
    setIsParsing(true);
    setError(null);
    setMessages([]);
    setBookContent(null);
    setBookTitle('');

    try {
      if (file.size > 200 * 1024 * 1024) {
        throw new Error("File exceeds 200MB limit.");
      }

      let content = '';
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        content = await file.text();
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        content = await parsePdf(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
        content = await parseDocx(file);
      } else {
        throw new Error("Unsupported file type. Please upload a .txt, .pdf, or .docx file.");
      }
      
      handleBookUpload(content, file.name);

    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during file processing.';
       setError(errorMessage);
       setBookContent(null);
       setBookTitle('');
       setMessages([]);
    } finally {
        setIsParsing(false);
    }
  };


  const handleSendMessage = useCallback(async (query: string) => {
    if (!bookContent) {
      setError('Please upload a book before asking questions.');
      return;
    }
    if (isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const aiResponseText = await analyzeBookContent(bookContent, query, settings);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get response from AI: ${errorMessage}`);
      const errorAiMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: `Sorry, I encountered an error. ${errorMessage}`};
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [bookContent, isLoading, settings]);

  return (
    <div className="flex h-screen w-screen bg-black text-gray-200 overflow-hidden">
      <Sidebar
        onFileSelect={handleFileSelect}
        settings={settings}
        onSettingsChange={setSettings}
        bookTitle={bookTitle}
        isLoading={isLoading || isParsing}
      />
      <main className="flex-1 flex flex-col h-screen">
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          error={error}
          bookUploaded={!!bookContent}
        />
      </main>
    </div>
  );
};

export default App;