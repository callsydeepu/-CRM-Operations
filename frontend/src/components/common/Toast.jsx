import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <span className="material-symbols-outlined">check_circle</span>}
            {toast.type === 'error' && <span className="material-symbols-outlined">error</span>}
            {toast.type === 'warning' && <span className="material-symbols-outlined">warning</span>}
            {toast.type === 'info' && <span className="material-symbols-outlined">info</span>}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button 
              className="btn btn-ghost" 
              onClick={() => removeToast(toast.id)}
              style={{ padding: '2px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
