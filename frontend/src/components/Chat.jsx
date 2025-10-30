import React, { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import "./ChatScreen.css";
import DescriptionIcon from '@mui/icons-material/Description';
import axios from "axios";
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

export default function ChatScreen({ onReset }) {

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [openDialog, setOpenDialog] = useState(false);

    const handleSend = async () => {

        try {
            setError("")
            if (!input.trim()) return;

            setMessages((prev) => [...prev, { sender: "user", text: input }]);

            const response = await axios.post("http://localhost:5001/api/ask", {
                question: input,
            });

            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: response.data.answer, page: response.data.page || null },
            ]);
            setInput("");
        } catch (error) {
            setMessages([])
            setInput("");
            setError("Network error occurred");
            console.error("Error asking question:", error);
        }
    };

    const handleDelete = (index) => {
        const updatedMessages = [...messages];

        if (index < updatedMessages.length - 1 && updatedMessages[index + 1].sender === "bot") {
            updatedMessages.splice(index, 2);
        } else {
            updatedMessages.splice(index, 1);
        }

        setMessages(updatedMessages);
    };
 const handleDeleteClick = () => setOpenDialog(true);

    const handleConfirmDelete = () => {
        setMessages([]);
        setError("");
        setOpenDialog(false);
        if (onReset) onReset();
    };

    const handleCancelDelete = () => setOpenDialog(false);

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {
                    error ? <div className="user-message space-btw">{error} <button
                        className="close-btn"
                        onClick={handleDeleteClick}
                        title="Delete message"
                    >
                        ✕
                    </button></div> : <div className="bot-message">
                        <div className="bot-message-header"><DescriptionIcon fontSize="large" /><h3> Your document is ready! </h3></div>
                        You can now ask questions about your document. For example:
                        <ul>
                            <li>What is the main topic of the document?</li>
                            <li>Can you summarize the key points?</li>
                            <li>What are the conclusions or recommendations?</li>
                        </ul>
                    </div>
                }
                {messages.map((msg, i) => (
                    <div key={i} className={msg.sender === "user" ? "user-message space-btw" : "bot-message space-btw"}>
                        {msg.sender === "user" ? (
                            <PersonOutlinedIcon sx={{ color: "blue" }} />
                        ) : (
                            <SmartToyOutlinedIcon sx={{ color: "purple" }} />
                        )}

                        <div className="message-text">
                            {msg.text}
                            {msg.page && <div className="message-page">Page {msg.page}</div>}
                        </div>

                        {msg.sender === "user" && (
                            <button
                                className="close-btn"
                                onClick={() => handleDelete(i)}
                                title="Delete message"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={input}
                    placeholder="Ask something about your PDF..."
                    onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={handleSend} disabled={!input.trim()}>
                    <SendIcon />
                </button>
            </div>

            <Dialog open={openDialog} onClose={handleCancelDelete}> 
                <DialogTitle><InfoOutlinedIcon fontSize="small" sx={{
                    color: "orange"
                }} /> Upload new PDF?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will delete the current chat and uploaded document. Are you sure you want to continue?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="secondary" variant="contained">
                        Upload new PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
