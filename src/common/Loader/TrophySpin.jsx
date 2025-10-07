import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

const sizeMap = {
  small: 16,
  medium: 24,
  large: 36,
  xl: 48,
};

function TrophySpin({
  color = "#ffffff",
  size = "medium",
  text = "",
  textColor = "#ffffff",
}) {
  const px =
    typeof size === "number" ? size : sizeMap[size] || sizeMap.medium;

  return (
    <div className="flex items-center space-x-2">
      <CircularProgress
        size={px}
        thickness={4}
        sx={{
          color: color,
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
        }}
      />
      {text && (
        <span
          className="text-sm font-medium"
          style={{ color: textColor }}
        >
          {text}
        </span>
      )}
    </div>
  );
}

export default TrophySpin;
