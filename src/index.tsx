import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { Provider } from 'react-redux'
import store from './store'
import { ThemeProvider, createTheme } from '@mui/material';
import { dispatchActionReloadState } from './dispatches';

const rootElement = document.getElementById('root');
if(!rootElement){
    throw new Error('Root element not found');
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#fff',
    },
    secondary: {
      main: '#eee',
    },
    background: {
      default: '#222',
    },
    text: {
      primary: '#eee',
      secondary: '#666',
    }
  },
  components: {
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: '#222',
        },
      },
    },
  },
});

dispatchActionReloadState(store.dispatch);

const root = ReactDOM.createRoot(rootElement);
root.render(<React.StrictMode>
    <ThemeProvider theme={theme}>
        <Provider store={store}><App /></Provider>
    </ThemeProvider>
</React.StrictMode>);