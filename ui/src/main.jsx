import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { initTelemetry } from './telemetry'
import { initWebVitals } from './telemetry/webvitals'

// Initialize telemetry
initTelemetry(window.location.pathname)
initWebVitals()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

