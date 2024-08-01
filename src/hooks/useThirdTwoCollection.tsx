import React, { useEffect, useState } from 'react'
import { collection, DocumentData, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useAppSelector } from '../app/hooks';
import { db } from '../firebase';

interface Letters {
    id: string;
    timestamp: Timestamp | null;
    letterBody: string;
    user: {
        uid: string;
        photo: string;
        email: string;
        displayName: string;
    };
}

const useThirdTwoCollection = (collectionName: string, secondCollectionName: string, thirdCollectionName: string) => {
    // Cloud Firescoreからデータ取得
    const collectionId = useAppSelector((state) => state.collection.collectionId);
    const playerId = useAppSelector((state) => state.player.playerId);
    const [thirdTwoDocuments, setThirdTwoDocuments] = useState<Letters[]>([]);

    useEffect(() => {
        if (!collectionId || !playerId) {
            setThirdTwoDocuments([]);
            return;
        }
        
        // コメントコレクションへの参照を取得
        const collectionRef = collection(
            db, 
            collectionName, 
            String(collectionId), 
            secondCollectionName,
            String(playerId),
            thirdCollectionName
        );
        const q = query(collectionRef, orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let results: Letters[] = [];
            snapshot.docs.forEach((doc) => {
                results.push({
                    id: doc.id,
                    timestamp: doc.data().timestamp,
                    letterBody: doc.data().letterBody,
                    user: doc.data().user,
                });
            });
            setThirdTwoDocuments(results);
        });

        // クリーンアップ関数
        return () => unsubscribe();
    }, [collectionId, playerId]);

  return { thirdTwoDocuments };
}

export default useThirdTwoCollection