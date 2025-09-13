import { useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import axios from "axios";
import { ServerURL } from "../ServerURL";

const UploadScreen = ({
  onUploadSuccess,
  onUploadError,
  isLoading,
  setIsLoading,
  variant = "full",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file || file.type !== "application/pdf") {
      onUploadError(new Error("Please upload a valid PDF file"));
      return;
    }

    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
    });

    const formData = new FormData();
    formData.append("pdf", file);

    // Log FormData contents (for debugging)
    for (let pair of formData.entries()) {
      console.log("FormData entry:", pair[0], pair[1]);
    }

    setIsLoading(true);

    try {
      console.log("Sending request to:", `${ServerURL}/api/upload`);
      const response = await axios.post(`${ServerURL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", response.data);
      onUploadSuccess(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      onUploadError(error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Handle button click to open file dialog
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const compact = variant === "compact";

  return (
    <div
      className={
        compact ? "" : "flex flex-col items-center justify-center py-10"
      }
    >
      <div className={compact ? "w-full" : "w-full max-w-xl"}>
        <div
          className={
            compact
              ? ""
              : "bg-neutral-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#90be6d]/20 p-8"
          }
        >
          {!compact && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#90be6d] to-[#141b10] rounded-2xl mb-4 shadow-lg">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#90be6d] to-[#141b10] bg-clip-text text-transparent">
                Upload Your Document
              </h2>
              <p className="text-white/80 mt-2">
                Transform your PDF into an interactive conversation
              </p>
            </div>
          )}

          <div
            className={`${
              compact ? "p-4" : "p-8"
            } border-2 border-dashed rounded-2xl text-center transition-all duration-300 ${
              dragActive
                ? "border-[#90be6d] bg-[#90be6d]/20 shadow-inner"
                : "border-[#90be6d]/30 hover:border-[#90be6d]/50 bg-neutral-800/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleChange}
              className="hidden"
            />

            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-[#90be6d]/20 border-t-[#90be6d] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#90be6d]" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">
                    Processing your PDF...
                  </p>
                  <p className="text-white/60 text-sm">
                    This may take a few moments
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  className={`${
                    compact ? "w-12 h-12" : "w-16 h-16"
                  } bg-gradient-to-br from-[#90be6d] to-[#141b10] rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Upload
                    className={`${compact ? "w-6 h-6" : "w-8 h-8"} text-white`}
                  />
                </div>

                {!compact && (
                  <p className="text-white/80 mb-4 font-medium">
                    Drag & drop your PDF here, or click to browse
                  </p>
                )}

                <button
                  onClick={onButtonClick}
                  className={`${
                    compact ? "text-sm px-4 py-2" : "px-6 py-3"
                  } bg-gradient-to-r from-[#90be6d] to-[#141b10] hover:from-[#141b10] hover:to-[#90be6d] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
                >
                  {compact ? "Browse Files" : "Choose PDF File"}
                </button>

                {!compact && (
                  <div className="mt-4 flex items-center gap-2 text-white/60 text-sm">
                    <div className="w-2 h-2 bg-[#90be6d] rounded-full"></div>
                    <span>Supports PDF files up to 10MB</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadScreen;
