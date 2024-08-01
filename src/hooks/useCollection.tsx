import React, { useState, useEffect } from 'react'
import { onSnapshot, collection, query, DocumentData, Query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface Collections {
  id: string;
  collection: DocumentData;
}

const useCollection = (data: string) => {
    // Cloud Firescoreからデータ取得
    const [documents, setDocuments] = useState<Collections[]>([]);
    const collectionRef: Query<DocumentData> = query(
        collection(db, data), orderBy("timestamp", "desc")
    );
    
    useEffect(() => {
      onSnapshot(collectionRef, (querySnapshot) => {
        const collectionsResultes: Collections[] = [];
        querySnapshot.docs.forEach((doc) => 
            collectionsResultes.push({
            id: doc.id,
            collection: doc.data(),
          })
        );
        setDocuments(collectionsResultes);
      });
    }, []);

  return { documents };
};

export default useCollection;