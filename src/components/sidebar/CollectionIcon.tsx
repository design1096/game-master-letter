import React from 'react'
import './CollectionIcon.scss';
import { DocumentData } from 'firebase/firestore';
import { useAppSelector } from '../../app/hooks';
import { useAppDispatch } from '../../app/hooks';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

type Props = {
    id: string;
    collection: DocumentData;
    onClick: () => void;
    onContextMenu?: (event: React.MouseEvent) => void;
    isSelected: boolean;
};

const CollectionIcon = (props: Props) => {
    const { id, collection, onClick, onContextMenu, isSelected } = props;
    const user = useAppSelector((state) => state.user.user);
    const dispatch = useAppDispatch();

    // collection.collection.user.uid と user?.uid が一致するかを確認
    const isUserCollection = collection.collection.user.uid === user?.uid;

  return (
    <div>
    {isUserCollection && (
        <div className={`collectionIcon ${isSelected ? 'selected' : ''}`} onClick={onClick} onContextMenu={onContextMenu}>
            {collection.collection.imageUrl ? (
                <img src={collection.collection.imageUrl} alt={collection.collection.title} />
            ) : (
                <ImageNotSupportedIcon className="iconPlaceholder" />
            )}
        </div>
    )}
    </div>
  )
}

export default CollectionIcon