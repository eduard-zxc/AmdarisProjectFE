import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from './components/Auth/AuthProvider';
import { NotificationProvider } from './components/NotificationsProvider';
import { UserProvider } from './components/UserContext';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NotificationProvider>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
        authorizationParams={{
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    redirect_uri: window.location.origin,
    scope: 'openid profile email',
  }}
      cacheLocation="localstorage"
    >
      <AuthProvider>  
        <UserProvider>
        <App />
        </UserProvider>
      </AuthProvider>
    </Auth0Provider>
    </NotificationProvider>
  </React.StrictMode>
);