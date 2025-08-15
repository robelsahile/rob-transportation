
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // We'll need a basic css file for any global styles if not using tailwind exclusively.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
