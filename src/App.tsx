import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { EditorView } from '@/components/EditorView'
import { FlowView } from '@/components/FlowView'
import { FlashcardView } from '@/components/FlashcardView'
import { parseMarkdown, ParsedData } from '@/utils/parser'
import { extractTextFromPDF } from '@/utils/pdf'
import { processTextWithAI } from '@/utils/ai'
import { processTextWithRules } from '@/utils/fallback'
import { Loader2, Upload } from 'lucide-react'

function App() {
  const [markdown, setMarkdown] = useState<string>(() => {
    // Load from local storage or default
    return localStorage.getItem('noteflow-markdown') || 
      "# Welcome to NoteFlow\n- Edit this text on the left.\n- Click Generate to see the magic.\n\n# Features\n- Visual Diagrams : Automatically created from bullets\n- Flashcards : Created from 'Term : Definition' format\n\n# Getting Started\n- Type your notes\n- Use hashtags for main nodes\n- Use dashes for connections"
  })
  
  const [parsedData, setParsedData] = useState<ParsedData>({ 
    nodes: [], 
    edges: [], 
    flashcards: [] 
  })

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse on load
  useEffect(() => {
    handleGenerate();
  }, []) // eslint-disable-line

  const handleGenerate = () => {
    const data = parseMarkdown(markdown);
    setParsedData(data);
    localStorage.setItem('noteflow-markdown', markdown);
  }

  // Auto-save markdown to state, but don't re-parse constantly
  const handleMarkdownChange = (value: string) => {
    setMarkdown(value);
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    setIsProcessing(true);
    let rawText = '';

    // Step 1: Extract Text
    try {
      rawText = await extractTextFromPDF(file);
    } catch (pdfError) {
      console.error('PDF Extraction failed:', pdfError);
      alert(`PDF Extraction Error: ${(pdfError as Error).message}`);
      setIsProcessing(false);
      return;
    }

    // Step 2: Try AI, Fallback on Error
    try {
      const structuredContent = await processTextWithAI(rawText);
      setMarkdown(structuredContent);
      
      // Update Parse
      const data = parseMarkdown(structuredContent);
      setParsedData(data);
      localStorage.setItem('noteflow-markdown', structuredContent);

    } catch (aiError) {
      console.warn('AI Processing failed, attempting fallback:', aiError);
      const message = (aiError as Error).message;
      
      // Notify user about fallback
      alert(`AI Processing Failed (${message}). Using Rule-Based Fallback instead.`);
      
      const fallbackContent = processTextWithRules(rawText);
      setMarkdown(fallbackContent);
      
      // Update Parse
      const data = parseMarkdown(fallbackContent);
      setParsedData(data);
      localStorage.setItem('noteflow-markdown', fallbackContent);
    } finally {
      setIsProcessing(false);
      // Reset input value
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <header className="border-b p-4 flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">NoteFlow</h1>
        <div className="flex gap-2">
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={handleUploadClick} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import PDF
                </>
              )}
            </Button>
            <Button onClick={handleGenerate}>Generate Research</Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden p-4">
        <Tabs defaultValue="editor" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px] mb-4 shrink-0">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="flow">Diagram</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="flex-1 border rounded-lg overflow-hidden h-full">
            <EditorView value={markdown} onChange={handleMarkdownChange} />
          </TabsContent>
          
          <TabsContent value="flow" className="flex-1 border rounded-lg overflow-hidden h-full relative">
            <FlowView nodes={parsedData.nodes} edges={parsedData.edges} />
          </TabsContent>
          
          <TabsContent value="flashcards" className="flex-1 border rounded-lg overflow-hidden h-full relative">
            <FlashcardView cards={parsedData.flashcards} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
