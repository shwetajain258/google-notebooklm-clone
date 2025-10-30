import React, { useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";

export default function Loader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        const diff = Math.random() * 10; 
        return Math.min(oldProgress + diff, 100);
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        // ",
        margin: "60px auto",
        textAlign: "center",
      }}
    >
      <h5 style={{ color: "#6b21a8", marginBottom: "10px", display: "flex", justifyContent: "space-between", }}>
        Uploading PDF...
        <span
          style={{
            minWidth: 40,
            color: "#4b5563",
            fontWeight: 600,
          }}
        >
          {`${Math.round(progress)}%`}
        </span>
      </h5>
      

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "400px",
        }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            flexGrow: 1,
            height: 10,
            borderRadius: 5,
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#8b5cf6",
            },
          }}
        />
        
      </div>
    </div>
  );
}

