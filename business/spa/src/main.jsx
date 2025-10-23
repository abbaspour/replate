import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App';
import {Auth0ProviderWithConfig} from './auth/AuthContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Auth0ProviderWithConfig>
                <App />
            </Auth0ProviderWithConfig>
        </BrowserRouter>
    </React.StrictMode>,
);
