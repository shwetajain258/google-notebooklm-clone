import React, { useRef } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Loader from "./Loader";
import "./UploadFile.css";
import axios from "axios";

export default function Upload({ onFileSelect, loading }) {
    const fileInputRef = useRef(null);

    //   Const API_BASE_URL = "http://localhost:5001";
    //   const API_BASE_URL = "https://google-notebooklm-clone-kpqu.onrender.com";
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {


            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.status === 200) {
                localStorage.setItem("sessionId", res.data.sessionId);
                onFileSelect(file);
            } else {
                alert(res.data.error || "Upload failed");
            }
        } catch (err) {
            console.error("Error uploading file:", err);
            alert("Failed to upload file");
        }
    };

    return (
        <div className="upload-wrapper">
            {loading ? (
                <Loader />
            ) : (
                <div
                    className="upload-card"
                    onClick={() => fileInputRef.current.click()}
                >
                    <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        className="hidden-input"
                        onChange={handleFileSelect}
                    />
                    <CloudUploadIcon style={{ fontSize: 60, color: "#8b5cf6" }} />
                    <h3>Upload PDF to start chatting</h3>
                    <p>Click or drag your file here</p>
                </div>
            )}
        </div>
    );
}
