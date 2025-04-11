"use client";

import React, { useState, useRef, useEffect } from 'react'; 
import ProtectedRoute from '@/components/ProtectedRoute';

interface ChatMessage {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
  imagePreview?: string; 
}

// Supported languages for TTS (ISO 639-1 codes roughly corresponding to BCP 47)
const supportedLanguages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'hi-IN', name: 'हिन्दी (भारत)' }, // Hindi (India)
  { code: 'kn-IN', name: 'ಕನ್ನಡ (ಭಾರತ)' }, // Kannada (India)
  { code: 'ta-IN', name: 'தமிழ் (இந்தியா)' }, // Tamil (India)
  { code: 'te-IN', name: 'తెలుగు (భారతదేశం)' } // Telugu (India)
];

// Define minimal interfaces for Web Speech API types
interface CustomSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    isFinal: boolean;
    [key: number]: {
      transcript: string;
    };
    length: number; // Add length property
  }[];
}

interface CustomSpeechRecognitionErrorEvent {
  error: string; // Simplified error property
}

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const [isSharingScreen, setIsSharingScreen] = useState(false); 
  const [selectedLang, setSelectedLang] = useState<string>(supportedLanguages[0].code); // Default to English
  const [isListening, setIsListening] = useState(false); // State for listening status
  const screenStreamRef = useRef<MediaStream | null>(null); 
  const videoRef = useRef<HTMLVideoElement>(null); 
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for chat container
  const recognitionRef = useRef<any>(null); // Update ref type - Reverted to any as base type is not found

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
      stopScreenSharing();
      window.speechSynthesis.cancel(); // Stop any speech on unmount
    };
  }, []);

  // --- Initialize Speech Recognition --- 
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = true; 
    recognition.lang = selectedLang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null); 
      console.log("Speech recognition started");
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Speech recognition ended");
    };

    recognition.onerror = (event: CustomSpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onresult = (event: CustomSpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInputText(finalTranscript || interimTranscript);
      if (finalTranscript) {
          console.log("Final transcript received:", finalTranscript);
          // Optionally stop listening automatically
          // recognition.stop(); 
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLang]);

  const stopScreenSharing = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (videoRef.current) {
       videoRef.current.srcObject = null;
    }
    setIsSharingScreen(false);
  };

  const handleShareScreen = async () => {
    if (isSharingScreen) {
      stopScreenSharing();
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" } as any, // Add 'as any' to bypass type error
          audio: false
        });
        screenStreamRef.current = stream;
        setIsSharingScreen(true);
        setError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => console.error("Video play failed:", err)); // Try to play
        }
        stream.getVideoTracks()[0].onended = () => {
           stopScreenSharing();
        };
      } catch (err) {
        console.error("Error starting screen share:", err);
        setError("Failed to start screen sharing. Please grant permission.");
        stopScreenSharing(); 
      }
    }
  };

  const sendAnalysisRequest = async (prompt: string, image: File | null, imagePreviewForChat?: string) => {
    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: prompt,
      ...(imagePreviewForChat && { imagePreview: imagePreviewForChat }),
    };
    setChatHistory(prev => [...prev, newUserMessage]);

    const formData = new FormData();
    formData.append('prompt', prompt);
    if (image) {
      formData.append('image', image);
    }
    formData.append('language', selectedLang);
    setInputText(''); 

    try {
      const response = await fetch('/api/analyze-screen', {
        method: 'POST',
        body: formData,
        signal: signal
      });

      if (signal.aborted) {
        console.log("Fetch aborted before response processing.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from assistant.');
      }
      const data = await response.json();
      
      if (signal.aborted) {
        console.log("Fetch aborted before adding assistant message.");
        return;
      }

      const analysisText = data.analysis;
      if (!analysisText) {
         throw new Error("Received empty analysis from assistant.");
      }
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: analysisText,
      };
      setChatHistory(prev => [...prev, assistantMessage]);
      speakText(analysisText);

    } catch (err: unknown) {
       if (err instanceof Error && err.name === 'AbortError') {
          console.log('Fetch aborted successfully.');
       } else {
          console.error("Failed to send message:", err);
          // Type guard for error message
          const message = err instanceof Error ? err.message : 'Could not get response.';
          setError(message);
          const errorMsg: ChatMessage = { id: Date.now() + 1, sender:'assistant', text: `⚠️ Error: ${message}`};
          setChatHistory(prev => [...prev, errorMsg]);
       }
    } finally {
      if (!signal.aborted) {
         setIsLoading(false);
      }
      abortControllerRef.current = null;
    }
  };

  const handleTakeScreenshot = async () => {
    if (!isSharingScreen || !screenStreamRef.current) {
      setError("Screen sharing is not active.");
      return;
    }
    if (!inputText.trim()) {
       setError("Please enter a question or prompt before taking a screenshot.");
       return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const videoTrack = screenStreamRef.current.getVideoTracks()[0];
      if (!videoTrack) {
         throw new Error("No video track found in the screen share stream.");
      }
      let blob: Blob | null = null;
      // Define minimal type for ImageCapture constructor
      type ImageCaptureConstructor = new (track: MediaStreamTrack) => {
         grabFrame: () => Promise<ImageBitmap>;
         // Add other methods if needed
      };

      if (typeof window !== 'undefined' && 'ImageCapture' in window && typeof (window as any).ImageCapture !== 'undefined') {
        try {
          const ImageCaptureClass = (window as any).ImageCapture as ImageCaptureConstructor;
          const imageCapture = new ImageCaptureClass(videoTrack);
          // Grab frame might need specific settings state check
          if (videoTrack.readyState !== 'live') {
            throw new Error('Video track is not live, cannot capture frame.');
          }
          const bitmap = await imageCapture.grabFrame();
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext('bitmaprenderer') || canvas.getContext('2d'); 
          if (!ctx) throw new Error("Could not get canvas context");
          if (ctx instanceof CanvasRenderingContext2D) {
              ctx.drawImage(bitmap, 0, 0);
          } else if (ctx instanceof ImageBitmapRenderingContext) {
             ctx.transferFromImageBitmap(bitmap);
          } else {
             (ctx as any).drawImage(bitmap, 0, 0);
          }
          blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        } catch (captureError) {
          console.warn("ImageCapture failed, falling back to video element method:", captureError);
           if (captureError instanceof Error) {
              setError(`ImageCapture Error: ${captureError.message}. Trying fallback.`);
           } else {
              setError(`ImageCapture Error: Unknown error. Trying fallback.`);
           }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      if (!blob && videoRef.current) {
         const videoElement = videoRef.current;
        if (videoElement.readyState < videoElement.HAVE_CURRENT_DATA) { // Check video state
          await new Promise(resolve => setTimeout(resolve, 300)); // Increased delay slightly
           if (videoElement.readyState < videoElement.HAVE_CURRENT_DATA) {
             throw new Error("Video not ready for screenshot (fallback).");
           }
        }
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            throw new Error("Video has no dimensions (fallback).");
        }
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context (fallback)");
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      }
      if (!blob) {
        throw new Error("Failed to capture screenshot using any method.");
      }
      const screenshotFile = new File([blob], "screenshot.png", { type: "image/png" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewDataUrl = reader.result as string;
        sendAnalysisRequest(inputText, screenshotFile, previewDataUrl);
      };
      reader.readAsDataURL(screenshotFile);
    } catch (err: unknown) {
      console.error("Failed to take screenshot or send:", err);
       // Type guard for error message
      const message = err instanceof Error ? err.message : 'Failed to capture or send screenshot due to unknown error.';
      setError(message);
      setIsLoading(false);
    }
  };

  // --- Toggle Voice Input --- 
  const handleToggleListening = () => {
    if (!recognitionRef.current) {
        setError("Speech recognition not supported or initialized.");
        return;
    }
    if (isListening) {
      // Stop listening
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Check if there's transcribed text and send it
      const transcribedText = inputText.trim();
      if (transcribedText) {
          console.log("Sending transcribed text:", transcribedText);
          if (isSharingScreen) {
              handleTakeScreenshot(); // Send with screenshot if sharing
          } else {
              sendAnalysisRequest(transcribedText, null); // Send text only
          }
      } else {
          console.log("Listening stopped, no text to send.");
      }

    } else {
      // Start listening
      try {
        recognitionRef.current.lang = selectedLang; // Ensure correct language is set just before starting
        recognitionRef.current.start();
      } catch (err: unknown) {
         console.error("Error starting speech recognition:", err);
         // Type guard for error message
          const message = err instanceof Error ? err.message : 'Could not start listening';
         setError(`Could not start listening: ${message}`);
      }
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
       abortControllerRef.current.abort(); 
       console.log("Aborted API request");
       // isLoading is set to false in the finally block of sendAnalysisRequest
       const stopMessage: ChatMessage = {
         id: Date.now(),
         sender: 'assistant',
         text: "(Generation stopped by user)", 
       };
       setChatHistory(prev => [...prev, stopMessage]);
    }
  };
  
  const speakText = (textToSpeak: string) => {
    if ('speechSynthesis' in window && textToSpeak) {
       window.speechSynthesis.cancel(); 
       const utterance = new SpeechSynthesisUtterance(textToSpeak);
       utterance.lang = selectedLang; // Use selected language
       utterance.rate = 1; 
       utterance.pitch = 1; 
       
       // --- Refined Voice Selection --- 
       const voices = window.speechSynthesis.getVoices();
       // Prefer exact match first
       let voice = voices.find(v => v.lang === selectedLang);
       
       // Fallback to base language match if exact not found
       if (!voice) {
         const baseLang = selectedLang.split('-')[0];
         voice = voices.find(v => v.lang.startsWith(baseLang));
       }

       if (voice) {
          utterance.voice = voice;
          console.log(`Using voice: ${voice.name} (${voice.lang})`); // Log the found voice
       } else {
          console.warn(`No specific voice found for lang ${selectedLang} or base lang ${selectedLang.split('-')[0]}, using browser default for the language.`);
       }

       window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported or no text to speak.");
    }
  };

  return (
    <ProtectedRoute>
       <div className="flex flex-col h-full w-full">
        <video ref={videoRef} autoPlay muted playsInline className="hidden"></video>
        {/* Chat messages display area */}
        {/* Added ref and height/overflow styling */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 bg-white rounded-t-lg shadow-inner space-y-4 h-[calc(100%-150px)]"> 
           {chatHistory.length === 0 && !isLoading && (
              <p className="text-gray-500 text-center italic">Chat history is empty. Ask a question or share your screen!</p>
           )}
           {chatHistory.map((msg) => (
             <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`p-3 rounded-lg max-w-xl shadow-md ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                 {msg.imagePreview && (
                   <img src={msg.imagePreview} alt="User upload preview" className="max-w-xs max-h-40 mb-2 rounded" />
                 )}
                 <p className="whitespace-pre-wrap break-words">{msg.text}</p> 
               </div>
             </div>
           ))}
           {isLoading && (
             <div className="flex justify-center items-center p-4 gap-4">
                {/* Basic Spinner */} 
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <p className="text-gray-500 italic">Assistant is thinking...</p> 
                <button 
                  onClick={handleStopGeneration} 
                  className="px-3 py-1 rounded bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
                >
                  Stop 
                </button>
             </div>
           )}
           {/* Error display at the bottom of chat */} 
           {error && (
              <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                 <p><strong className="font-bold">Error:</strong> {error}</p>
               </div>
           )}
        </div>
        {/* Input Area */} 
        <div className="p-4 bg-gray-100 border-t border-gray-200 rounded-b-lg space-y-3 min-h-[150px]">
          {/* Control Buttons */} 
          <div className="flex flex-wrap items-center gap-2">
             <button
               onClick={handleShareScreen}
               className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-semibold text-sm shadow transition-colors duration-150 ${isSharingScreen ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'} disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 ${isSharingScreen ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}`}
               disabled={isLoading} 
             >
                {isSharingScreen ? 
                   <> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.204 3.172a2.25 2.25 0 013.592 0l4 4a2.25 2.25 0 010 3.182l-4 4a2.25 2.25 0 01-3.592-3.182L7.99 9.25H2.75a.75.75 0 010-1.5H8l-2.796-1.896a2.25 2.25 0 010-3.182zM12.75 7.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg> Stop Sharing </> : 
                   <> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 6a1 1 0 00-1 1v.01a1 1 0 001 1h12a1 1 0 001-1V11a1 1 0 00-1-1H4z" /></svg> Share Screen </> } 
             </button>
             <button
               onClick={handleTakeScreenshot}
               className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
               disabled={!isSharingScreen || isLoading || !inputText.trim()}
               title={!isSharingScreen ? "Start screen sharing first" : !inputText.trim() ? "Enter a prompt first" : "Capture screen and analyze"}
             >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.75-.25a.75.75 0 01.75-.75h13.5a.75.75 0 01.75.75v9.5a.75.75 0 01-.75.75H3.25a.75.75 0 01-.75-.75v-9.5z" clipRule="evenodd" /><path d="M6.75 7a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" /></svg>
                Analyze Screen
             </button>
             {/* --- Voice Input Button --- */} 
             <button
               onClick={handleToggleListening}
               className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed 
                         ${isListening ? 'bg-red-500 text-white focus:ring-red-400 hover:bg-red-600' : 'bg-blue-500 text-white focus:ring-blue-400 hover:bg-blue-600'}`}
               title={isListening ? "Stop Listening" : "Start Listening"}
               disabled={isLoading} 
             >
               {isListening ? (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M5.5 3.5A2.5 2.5 0 018 6v4a2.5 2.5 0 01-5 0V6a2.5 2.5 0 012.5-2.5zM8 6a2.5 2.5 0 00-5 0v4a2.5 2.5 0 005 0V6z"/><path d="M10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zM3.75 10.75a.75.75 0 00-1.5 0v.5A5.75 5.75 0 007.5 17v1.5a.75.75 0 001.5 0V17a5.75 5.75 0 005.25-5.75v-.5a.75.75 0 00-1.5 0v.5a4.25 4.25 0 01-8.5 0v-.5z"/></svg> 
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17.5a.75.75 0 01-1.5 0v-2.57A6.003 6.003 0 014 9V8a.75.75 0 011.5 0v1a4.5 4.5 0 109 0v-1a.75.75 0 011.5 0v1a6.003 6.003 0 01-3 5.181v.769a.75.75 0 01-1.5 0v-.77z" clipRule="evenodd" /></svg>
               )}
             </button>
             {/* Language Selector */} 
             <div className="ml-auto">
               <label htmlFor="lang-select" className="sr-only">Select Language</label>
               <select 
                 id="lang-select"
                 value={selectedLang}
                 onChange={(e) => setSelectedLang(e.target.value)}
                 className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5 shadow-sm cursor-pointer"
                 disabled={isLoading}
               >
                 {supportedLanguages.map(lang => (
                   <option key={lang.code} value={lang.code}>
                     {lang.name}
                   </option>
                 ))}
               </select>
             </div>
          </div>
          {/* Text Input */} 
          <div className="flex items-end gap-2">
            <textarea 
              placeholder={isSharingScreen ? "Ask a question about your screen..." : "Ask anything about finance..."} 
              className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm disabled:bg-gray-100"
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); setError(null); }} // Clear error on type
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && !e.shiftKey) { 
                  e.preventDefault(); 
                  if (isSharingScreen && inputText.trim()) {
                    handleTakeScreenshot(); // Analyze screen if sharing
                  } else if (!isSharingScreen && inputText.trim()) {
                    sendAnalysisRequest(inputText, null); // Send text only if not sharing
                  }
                } 
              }}
              rows={1} 
              style={{ height: 'auto', minHeight: '40px', maxHeight: '100px' }} // Limit max height
              disabled={isLoading}
            />
          </div>
        </div>
       </div>
    </ProtectedRoute>
  );
}
