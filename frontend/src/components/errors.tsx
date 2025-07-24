import React, { useEffect } from 'react';
import './ErrorPopup.css';

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  if (!message) return null;

  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // auto-close after 5s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="error-overlay">
      <div className="error-popup">
        <h2>Error</h2>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ErrorPopup;
