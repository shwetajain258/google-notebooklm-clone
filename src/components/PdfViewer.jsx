import React from "react";

export default function PDFViewer({ fileUrl }) {
  return (
    // <embed
    //   src={fileUrl}
    //   type="application/pdf"
    //   width="100%"
    //   height="100%"
    //   style={{ border: "none" }}
    // />
    <iframe
      title="pdf-viewer-title"
      src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
      // src={fileUrl}
      width="100%"
      height="100%"
      style={{ border: "none" }}
    />
  );
}


