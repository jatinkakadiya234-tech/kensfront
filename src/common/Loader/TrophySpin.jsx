import React from "react";

const sizeMap = {
  small: 16,
  medium: 20,
  large: 28,
  xl: 36,
};

function TrophySpin({ color = "#ffffff", size = "medium", text = "", textColor = "#ffffff" }) {
  const px = typeof size === "number" ? size : (sizeMap[size] || sizeMap.medium);

  return (
    <div className="flex items-center">
      <span
        aria-label="loading"
        className="inline-block animate-spin rounded-full border-4 border-solid"
        style={{
          width: px,
          height: px,
          borderColor: "rgba(255,255,255,0.25)",
          borderTopColor: color,
        }}
      />
      {text ? (
        <span className="ml-2 text-sm font-medium" style={{ color: textColor }}>{text}</span>
      ) : null}
    </div>
  );
}

export default TrophySpin;


