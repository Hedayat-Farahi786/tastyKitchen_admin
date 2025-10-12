import React from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { Button } from "reactstrap";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = "Something went wrong. Please try again.",
  onRetry,
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-center animate-scale-in">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-primary-50 to-red-50 p-6 rounded-full">
          <FiAlertCircle className="h-16 w-16 text-primary-600" />
        </div>
      </div>
      <h3 className="mt-6 text-xl font-bold text-gray-900">
        Oops! Something went wrong
      </h3>
      <p className="mt-3 text-gray-600 max-w-md">{message}</p>
      {onRetry && (
        <Button
          color="danger"
          className="mt-6 px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center"
          onClick={onRetry}
        >
          <FiRefreshCw className="mr-2 h-5 w-5" />
          Try Again
        </Button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50 p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 md:p-12">
      {content}
    </div>
  );
};

export default ErrorMessage;
