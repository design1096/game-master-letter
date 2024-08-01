import { createSlice } from "@reduxjs/toolkit";
import { InitialCollectionState } from "../Types";

const initialState: InitialCollectionState = {
    collectionId: null,
    title: null,
    category: null,
    imageUrl: null,
};

export const collectionSlice = createSlice({
    name: "collection",
    initialState,
    reducers: {
        setCollectionInfo: (state, action) => {
            state.collectionId = action.payload.collectionId;
            state.title = action.payload.title;
            state.category = action.payload.title;
            state.imageUrl = action.payload.imageUrl;
        }
    },
});

export const { setCollectionInfo } = collectionSlice.actions;
export default collectionSlice.reducer;