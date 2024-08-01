import React, { useEffect, useState } from 'react'
import { collection, DocumentData, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useAppSelector } from '../app/hooks';
import { db } from '../firebase';

interface Comments {
    id: string;
    timestamp: Timestamp | null;
    comment: string;
    user: {
        uid: string;
        photo: string;
        email: string;
        displayName: string;
    };
}

const useThirdCollection = (collectionName: string, secondCollectionName: string, thirdCollectionName: string) => {
    // Cloud Firescoreからデータ取得
    const collectionId = useAppSelector((state) => state.collection.collectionId);
    const playerId = useAppSelector((state) => state.player.playerId);
    const [thirdDocuments, setThirdDocuments] = useState<Comments[]>([]);
    
    useEffect(() => {
        if (!collectionId || !playerId) {
            setThirdDocuments([]);
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
            let results: Comments[] = [];
            snapshot.docs.forEach((doc) => {
                results.push({
                    id: doc.id,
                    timestamp: doc.data().timestamp,
                    comment: doc.data().comment,
                    user: doc.data().user,
                });
            });
            setThirdDocuments(results);
        });

        // クリーンアップ関数
        return () => unsubscribe();
    }, [collectionId, playerId]);

  return { thirdDocuments };
}

export default useThirdCollection