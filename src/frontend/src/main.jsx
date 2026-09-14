import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { RoleProvider } from './context/RoleContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { OperationalProvider } from './context/OperationalContext.jsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <RoleProvider>
          <OperationalProvider>
            <App />
          </OperationalProvider>
        </RoleProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
