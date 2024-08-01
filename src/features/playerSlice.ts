import { createSlice } from "@reduxjs/toolkit";
import { InitialPlayerState } from "../Types";

const initialState: InitialPlayerState = {
    playerId: null,
    playerName: null,
    roleName: null,
    timestamp: null,
};

export const playerSlice = createSlice({
    name: "player",
    initialState,
    reducers: {
        setPlayerInfo: (state, action) => {
            state.playerId = action.payload.playerId;
            state.playerName = action.payload.playerName;
            state.roleName = action.payload.roleName;
            state.timestamp = action.payload.timestamp;
        }
    },
});

export const { setPlayerInfo } = playerSlice.actions;
export default playerSlice.reducer;