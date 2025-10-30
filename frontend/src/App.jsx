import React, { useState } from "react";
import Upload from "./components/Upload";
import ChatScreen from "./components/Chat";
import PDFViewer from "./components/PdfViewer";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (pdfFile) => {
    setLoading(true);
    setTimeout(() => {
      setFile(URL.createObjectURL(pdfFile));
      setLoading(false);
    }, 2500);
  };

  // const handleFileSelect = (uploadedFileUrl) => {
  //   setFile(uploadedFileUrl);
  // };

  const handleReset = () => {
    setFile(null); 
  };

  return (
    <div className="app-container">

      {/* {!file ? (
          <div className="upload-center">
            <Upload onFileSelect={handleFileSelect} loading={loading} />
          </div>
        ) : (
          <div className="content-layout">
            <div className="left-pane">
              <ChatScreen />
            </div>
            <div className="right-pane">
              {file && <PDFViewer fileUrl={file} />}
            </div>
          </div>
        )} */}

      {!file ? (
        <div className="upload-center">
          <Upload onFileSelect={handleFileSelect} loading={loading} />
        </div>
      ) : (
        <div className="content-layout">
          <div className="left-pane">
            <ChatScreen onReset={handleReset} />
          </div>
          <div className="right-pane">
            <PDFViewer fileUrl={file} />
          </div>
        </div>
      )}
    </div>
  );
}


