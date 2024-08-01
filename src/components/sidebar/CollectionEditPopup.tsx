import React, { useEffect, useState } from 'react';
import './CollectionAddPopup.scss';
import { DocumentData } from 'firebase/firestore';

type Props = {
  collection: DocumentData;
  onClose: () => void;
  onSave: (id: string, title: string, category: string, imageUrl: string) => void;
};

const CollectionEditPopup: React.FC<Props> = ({ collection, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (collection) {
      setTitle(collection.collection.title);
      setCategory(collection.collection.category);
      setImageUrl(collection.collection.imageUrl);
    }
  }, [collection]);

  // 保存ボタン押下時処理
  const handleSave = () => {
    if (!title) {
      alert('作品名は入力必須項目です。');
      return;
    }
    if (!category) {
      alert('作品名のジャンルは入力必須項目です。');
      return;
    }
    if (collection?.id) {
      onSave(collection.id, title, category, imageUrl);
    }
    onClose();
  };

  return (
    <div className="popup">
      <div className="popupContent">
        <h2>コレクションを編集</h2>
        <div className='inputField'>
          <label>TRPG/マーダーミステリーの作品名 <span className="required">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className='inputField'>
          <label>作品名のジャンル <span className="required">*</span></label>
          <input
            type="text"
            placeholder="マーダーミステリー 等"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className='inputField'>
          <label>イメージ画像のURL</label>
          <input
            type="text"
            placeholder="https://"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />      
        </div>
        <div className="popupActions">
          <button className="saveButton" onClick={handleSave}>登録</button>
          <button className="cancelButton" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
};

export default CollectionEditPopup;