import React from "react";
import { Spinner } from "reactstrap";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  fullScreen = false,
  message = "Loading...",
}) => {
  let spinnerSize: "sm" | "lg" | undefined;
  if (size === "sm") {
    spinnerSize = "sm";
  } else if (size === "lg") {
    spinnerSize = "lg";
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in">
        <div className="relative">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary-200 animate-ping"></div>
          {/* Main spinner */}
          <Spinner
            color="danger"
            style={{
              width: "4rem",
              height: "4rem",
              borderWidth: "4px",
            }}
          />
        </div>
        <p className="mt-6 text-gray-600 font-medium text-lg animate-pulse">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-2 border-primary-200 animate-ping"></div>
        <Spinner color="danger" size={spinnerSize} />
      </div>
      {message && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
