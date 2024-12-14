import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {ApolloProvider} from '@apollo/client';
import client from "./services/apolloClient.js"

createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
  <StrictMode>
    <App />
  </StrictMode>
  </ApolloProvider>
);
