import React from 'react';
import './Toast.css';

export default function Toast({ type, message, onClose }) {
  return (
    <div className={`toast-item toast-${type}`} onClick={onClose}>
      <div className="toast-content">
        {type === 'success' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="toast-icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="toast-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        )}
        <span>{message}</span>
      </div>
      <button 
        className="toast-close" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onClose(); 
        }}
      >
        ✕
      </button>
    </div>
  );
}
