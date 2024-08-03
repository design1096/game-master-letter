import React, { useState } from 'react'
import './CommentListFirst.scss';
import { Avatar } from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
    id: string;
    timestamp: Timestamp | null;
    letterBody: string;
    onDelete: () => void;
    onSave: (id: string, newLetter: string) => void;
};

const LetterBody = (props: Props) => {
    const { id, letterBody, timestamp, onDelete, onSave } = props;
    const formattedTimestamp = timestamp ? new Date(timestamp.toDate()).toLocaleString() : 'Invalid Date';
    const [isEditing, setIsEditing] = useState(false);
    const [editedLetterBoddy, setEditedLetterBody] = useState(letterBody);

  // レター本文削除関数
  const handleDelete = () => {
    const confirmed = window.confirm('作成したデジタルレターを削除してもよろしいですか？');
    if (confirmed) {
      onDelete();
    }
  };

  // 編集モード切り替え関数
  const handleEdit = () => {
    setIsEditing(true);
  };

  // キャンセル関数
  const handleClose = () => {
    setIsEditing(false);
  };

  // 編集内容保存関数
  const handleSave = () => {
    onSave(id, editedLetterBoddy);
    setIsEditing(false);
  };

  return (
    <div className='commentFirstInner'>
        <Avatar />
        <div className={`commentFirstInfo ${isEditing ? 'editing' : ''}`}>
            <h4>
                Game Master's Letter
                <span className='commentTimeStamp'>
                    {formattedTimestamp}
                </span>
            </h4>
            {isEditing ? (
              <div className='editTextBox'>
                <textarea
                  className='editCommentTextarea'
                  value={editedLetterBoddy}
                  onChange={(e) => setEditedLetterBody(e.target.value)}
                />
              </div>
            ) : (
              <p className='commentText'>{letterBody}</p>
            )}
        </div>
        <div className='commentActions'>
            {isEditing && (<SaveIcon onClick={handleSave} />)}
            {isEditing && (<CloseIcon className='closeIcon' onClick={handleClose} />)}
            {!isEditing && (<EditIcon onClick={handleEdit} />)}
            {!isEditing && (<DeleteIcon onClick={handleDelete} />)}
        </div>
    </div>
  )
}

export default LetterBody