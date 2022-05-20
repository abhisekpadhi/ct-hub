import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Dashboard from './Dashboard';

function RoutedApp() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<App />} />
                <Route path={'/dashboard'} element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    )
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RoutedApp />
  </React.StrictMode>
)
