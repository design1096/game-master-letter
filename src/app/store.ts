import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import collectionReducer from "../features/collectionSlice";
import playerReducer from '../features/playerSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        collection: collectionReducer,
        player: playerReducer,
    }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;