import { collection, DocumentData, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useAppSelector } from '../app/hooks';
import { db } from '../firebase';

interface Players {
    id: string;
    player: DocumentData;
}

const useSecondCollection = (collectionName: string, secondCollectionName: string) => {
    // Cloud Firescoreからデータ取得
    const collectionId = useAppSelector((state) => state.collection.collectionId);
    const [secondDocuments, setSecondDocuments] = useState<Players[]>([]);

    useEffect(() => {
        let collectionRef = collection(
            db, 
            collectionName, 
            String(collectionId), 
            secondCollectionName
        );
        const q = query(collectionRef, orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let results: Players[] = [];
            snapshot.docs.forEach((doc) => {
                results.push({
                    id: doc.id,
                    player: doc.data(),
                });
            });
            setSecondDocuments(results);
        });

        // クリーンアップ関数
        return () => unsubscribe();
    }, [collectionId]);

  return { secondDocuments };
}

export default useSecondCollection