import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { reportWebVitals } from './lib/reportWebVitals';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Coleta Core Web Vitals após o render inicial.
// Em prod, substituir pelo handler do seu analytics:
// reportWebVitals((metric) => sendToAnalytics(metric));
reportWebVitals();
