import React, { useState, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { ZoomIn, ZoomOut, Upload, Send, Loader2, Languages } from 'lucide-react';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const prompts = {
  zh: "你是一個專業的面試助手，負責回答關於這份履歷的問題。請基於履歷內容提供準確、專業的回答。如果問題超出履歷範圍，請明確指出。回答時要保持專業、客觀的語氣。",
  en: "You are a professional interview assistant responsible for answering questions about this resume. Please provide accurate and professional answers based on the resume content. If a question goes beyond the scope of the resume, please clearly indicate this. Maintain a professional and objective tone in your responses."
};

const translations = {
  zh: {
    title: "Ask about me",
    upload: "點擊上傳或拖放 PDF 檔案",
    questionPlaceholder: "請輸入您的問題... (按 Enter 送出，Shift+Enter 換行)",
    processing: "處理中...",
    askQuestion: "送出問題",
    answer: "回答：",
    error: "抱歉，處理您的問題時發生錯誤。請重試。",
    disclaimer: "* 回答僅供參考，請以 PDF 內容為準",
    designer: "設計者",
    currentModel: "使用模型",
    scrollHint: "* 可上下滾動查看完整內容",
    apiKeyError: "請先設定 OpenAI API Key"
  },
  en: {
    title: "Ask about me",
    upload: "Click to upload or drag and drop a PDF file",
    questionPlaceholder: "Ask a question... (Press Enter to submit, Shift+Enter for new line)",
    processing: "Processing...",
    askQuestion: "Ask Question",
    answer: "Answer:",
    error: "Sorry, there was an error processing your question. Please try again.",
    disclaimer: "* Answers are for reference only, please refer to the PDF content",
    designer: "Designer",
    currentModel: "Current Model",
    scrollHint: "* Scroll to view full content",
    apiKeyError: "Please set your OpenAI API Key first"
  }
};

function App() {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(0.9);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  useEffect(() => {
    // 設置默認的 PDF 檔案
    const defaultPdfPath = import.meta.env.BASE_URL + '許育宸.pdf';
    setPdfFile(defaultPdfPath);
  }, []);

  async function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    if (pdfFile) {
      const pdf = await pdfjs.getDocument(pdfFile).promise;
      let fullText = '';
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      setPdfText(fullText);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfFile(url);
      setAnswer('');
      setPdfText('');
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !pdfText) return;

    setIsLoading(true);
    try {
      // 改为从后端获取响应
      const response = await fetch('https://api.yuchenhsu.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: prompts[language]
            },
            {
              role: "user",
              content: `这是一份履歷的內容：\n\n${pdfText}\n\n問題：${question}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setAnswer(data.choices[0].message.content || translations[language].error);
    } catch (error) {
      console.error('Error:', error);
      setAnswer(translations[language].error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuestionSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{translations[language].title}</h1>
              <p className="text-sm text-gray-500 mt-1">{translations[language].disclaimer}</p>
            </div>
            <button
              onClick={() => setLanguage(prev => prev === 'zh' ? 'en' : 'zh')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Languages className="w-5 h-5" />
              <span>{language.toUpperCase()}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            <div className="w-full md:w-auto">
              <span className="font-semibold">{translations[language].designer}:</span> 許育宸
            </div>
            <div className="w-full md:w-auto">
              <span className="font-semibold">Email:</span> rufushsu9987@gmail.com
            </div>
            <div className="w-full md:w-auto">
              <span className="font-semibold">Phone:</span> 0975-115-201
            </div>
            <div className="w-full md:w-auto">
              <span className="font-semibold">{translations[language].currentModel}:</span> GPT-3.5-turbo
            </div>
          </div>
          
          {!pdfFile && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-12 text-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center">
                  <Upload className="w-8 md:w-12 h-8 md:h-12 text-gray-400 mb-4" />
                  <span className="text-gray-600">{translations[language].upload}</span>
                </div>
              </label>
            </div>
          )}

          {pdfFile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                  <div className="flex space-x-4 items-center">
                    <button
                      onClick={() => setScale(scale => Math.max(0.5, scale - 0.1))}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setScale(scale => Math.min(2, scale + 0.1))}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <span className="p-2">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 italic">
                    {translations[language].scrollHint}
                  </p>
                </div>

                <div className="border rounded-lg bg-gray-50 overflow-y-auto max-h-[calc(100vh-300px)] w-full">
                  <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex flex-col items-center p-4"
                  >
                    {Array.from(new Array(numPages), (_, index) => (
                      <div key={`page_${index + 1}`} className="mb-4 w-full flex justify-center">
                        <Page
                          pageNumber={index + 1}
                          scale={scale}
                          className="shadow-lg bg-white"
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                        />
                      </div>
                    ))}
                  </Document>
                </div>
              </div>

              <div className="flex flex-col h-full">
                <div className="bg-gray-50 rounded-lg p-4 md:p-6 flex-grow">
                  <h2 className="text-xl font-semibold mb-4">{translations[language].title}</h2>
                  <form onSubmit={handleQuestionSubmit} className="space-y-4">
                    <div>
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={translations[language].questionPlaceholder}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !pdfText}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{translations[language].processing}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>{translations[language].askQuestion}</span>
                        </>
                      )}
                    </button>
                  </form>

                  {answer && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">{translations[language].answer}</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        {answer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;