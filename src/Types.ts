import { Timestamp } from "firebase/firestore";

export interface InitialUserState {
    user: null | {
        uid: string;
        photo: string;
        email: string;
        displayName: string;
    };
}

export interface InitialCollectionState {
    collectionId: string | null;
    title: string | null;
    category: string | null;
    imageUrl: string | null;
}

export interface InitialPlayerState {
    playerId: string | null;
    playerName: string | null;
    roleName: string | null;
    timestamp: Timestamp | null;
}