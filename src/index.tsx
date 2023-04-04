import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { Provider } from 'react-redux'
import store from './store'
import { ThemeProvider, createTheme } from '@mui/material';

const rootElement = document.getElementById('root');
if(!rootElement){
    throw new Error('Root element not found');
}

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const root = ReactDOM.createRoot(rootElement);
root.render(<React.StrictMode>
    <ThemeProvider theme={theme}>
        <Provider store={store}><App /></Provider>
    </ThemeProvider>
</React.StrictMode>
);