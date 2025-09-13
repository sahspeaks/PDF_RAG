import { FileText, MessageCircle, Trash2 } from "lucide-react";
import UploadScreen from "./UploadScreen";

function Sidebar({
  onUploadSuccess,
  onUploadError,
  isUploading,
  setIsUploading,
  filesHistory,
  chatsByDoc = {},
  activeDocumentId,
  onSelectDocument,
  onClearHistories,
}) {
  return (
    <aside className="w-full md:w-80 bg-neutral-900 border-r border-green-500/30 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <div className="p-6 border-b border-green-500/30 bg-green-900/20">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#90be6d]" />
          Your Documents
        </h2>
        <UploadScreen
          onUploadSuccess={onUploadSuccess}
          onUploadError={onUploadError}
          isLoading={isUploading}
          setIsLoading={setIsUploading}
          variant="compact"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filesHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-800 rounded-2xl mb-4 border border-green-500/30">
              <FileText className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 text-sm">
              No documents yet. Upload your first PDF to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filesHistory.map((file) => {
              const messageCount = Math.max(
                (chatsByDoc[file.documentId]?.length || 0) - 1,
                0
              );
              const isActive = activeDocumentId === file.documentId;

              return (
                <button
                  key={file.documentId}
                  onClick={() => onSelectDocument(file.documentId)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-green-900/40 border-2 border-[#90be6d] shadow-md"
                      : "bg-neutral-800 hover:bg-green-900/20 border border-green-500/30 hover:border-green-500/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText
                          className={`w-4 h-4 ${
                            isActive ? "text-[#90be6d]" : "text-white/40"
                          }`}
                        />
                        <p
                          className={`text-sm font-semibold truncate ${
                            isActive ? "text-white" : "text-white/80"
                          }`}
                        >
                          {file.fileName}
                        </p>
                      </div>
                      <p className="text-xs text-white/60 mb-2">
                        {new Date(file.uploadedAt).toLocaleDateString()} •{" "}
                        {new Date(file.uploadedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            isActive
                              ? "bg-[#90be6d]/20 text-[#90be6d]"
                              : "bg-neutral-700 text-white/60"
                          }`}
                        >
                          <MessageCircle className="w-3 h-3" />
                          {messageCount} messages
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-[#90be6d] rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filesHistory.length > 0 && (
        <div className="p-4 border-t border-green-500/30">
          <button
            onClick={onClearHistories}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-red-400 transition-colors duration-200 group"
          >
            <Trash2 className="w-4 h-4 group-hover:text-red-400" />
            Clear all histories
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
