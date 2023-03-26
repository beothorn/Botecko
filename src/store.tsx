import { configureStore } from '@reduxjs/toolkit'
import thunkMiddleware from 'redux-thunk'
import appStateReducer from './appStateSlice'

const store = configureStore({
    reducer: {
        appState: appStateReducer,
    },
    middleware: [thunkMiddleware],
})
  
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;