import { useState, useEffect } from "react";
import { Sparkles, Menu, X, FileText } from "lucide-react";
import ChatScreen from "./components/ChatScreen";
import Sidebar from "./components/Sidebar";
import UploadScreen from "./components/UploadScreen";

function App() {
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [filesHistory, setFilesHistory] = useState([]);
  const [chatsByDoc, setChatsByDoc] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFiles = localStorage.getItem("filesHistory");
    const savedChats = localStorage.getItem("chatsByDoc");

    if (savedFiles) {
      setFilesHistory(JSON.parse(savedFiles));
    }
    if (savedChats) {
      setChatsByDoc(JSON.parse(savedChats));
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("filesHistory", JSON.stringify(filesHistory));
  }, [filesHistory]);

  useEffect(() => {
    localStorage.setItem("chatsByDoc", JSON.stringify(chatsByDoc));
  }, [chatsByDoc]);

  const handleUploadSuccess = (data) => {
    const { documentId, fileName } = data;
    const newFile = {
      documentId,
      fileName,
      uploadedAt: Date.now(),
    };

    setFilesHistory((prev) => [newFile, ...prev]);
    setChatsByDoc((prev) => ({
      ...prev,
      [documentId]: [
        {
          type: "system",
          content: `Great! I've successfully processed "${fileName}". You can now ask me anything about its content.`,
          timestamp: Date.now(),
        },
      ],
    }));
    setActiveDocumentId(documentId);
    setSidebarOpen(false); // Close sidebar on mobile after upload
  };

  const handleUploadError = (error) => {
    console.error("Upload error:", error);
    // Handle error display - you could add a toast notification here
  };

  const handleSelectDocument = (documentId) => {
    setActiveDocumentId(documentId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleMessagesChange = (messages) => {
    if (activeDocumentId) {
      setChatsByDoc((prev) => ({
        ...prev,
        [activeDocumentId]: messages,
      }));
    }
  };

  const handleReset = () => {
    setActiveDocumentId(null);
    setSidebarOpen(true); // Open sidebar to show upload options
  };

  const handleClearHistories = () => {
    setFilesHistory([]);
    setChatsByDoc({});
    setActiveDocumentId(null);
    localStorage.removeItem("filesHistory");
    localStorage.removeItem("chatsByDoc");
  };

  const activeFile = filesHistory.find(
    (file) => file.documentId === activeDocumentId
  );
  const activeMessages = activeDocumentId
    ? chatsByDoc[activeDocumentId] || []
    : [];

  return (
    <div className="h-screen bg-neutral-900 flex flex-col overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header - Fixed height and position */}
      <header className="flex-shrink-0 bg-gradient-to-r from-[#90be6d] to-[#141b10] text-white shadow-lg z-10">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  PDF AI Assistant
                </h1>
                <p className="text-green-100 text-xs hidden sm:block">
                  Intelligent document analysis powered by AI
                </p>
              </div>
            </div>
            {activeFile && (
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <FileText className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium truncate max-w-[200px]">
                  {activeFile.fileName}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div
          className={`fixed md:relative inset-y-0 left-0 z-30 w-80 md:w-72 lg:w-80 bg-neutral-900 border-r border-green-500/30 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } flex flex-col`}
          style={{
            top: sidebarOpen ? "0" : "auto",
            height: sidebarOpen ? "100vh" : "auto",
          }}
        >
          {/* Mobile Header in Sidebar */}
          {sidebarOpen && (
            <div className="md:hidden bg-gradient-to-r from-[#90be6d] to-[#141b10] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="font-semibold">PDF AI Assistant</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <Sidebar
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              filesHistory={filesHistory}
              chatsByDoc={chatsByDoc}
              activeDocumentId={activeDocumentId}
              onSelectDocument={handleSelectDocument}
              onClearHistories={handleClearHistories}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-neutral-900">
          {activeDocumentId ? (
            <div className="h-full">
              <ChatScreen
                documentId={activeDocumentId}
                fileName={activeFile?.fileName}
                messages={activeMessages}
                onMessagesChange={handleMessagesChange}
                onReset={handleReset}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-4 sm:p-8">
              <UploadScreen
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                isLoading={isUploading}
                setIsLoading={setIsUploading}
                variant="full"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
