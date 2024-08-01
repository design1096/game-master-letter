import React, { useState } from 'react'
import './CommentList.scss';
import { Timestamp } from 'firebase/firestore';
import { Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  id: string;
  timestamp: Timestamp | null;
  comment: string;
  user: {
      uid: string;
      photo: string;
      email: string;
      displayName: string;
  };
  onDelete: () => void;
  onSelect: (comment: string, isChecked: boolean) => void;
  onSave: (id: string, newComment: string) => void;
};

const CommentList = (props: Props) => {
  const { id, comment, timestamp, user, onDelete, onSelect, onSave } = props;
  const formattedTimestamp = timestamp ? new Date(timestamp.toDate()).toLocaleString() : 'Invalid Date';
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment);

  // コメント削除関数
  const handleDelete = () => {
    const confirmed = window.confirm('このコメントを削除してもよろしいですか？');
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
    onSave(id, editedComment);
    setIsEditing(false);
  };

  // チェックボックスの変更関数
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(comment, e.target.checked);
  };

  return (
    <div className='commentInner'>
        <Avatar src={user?.photo} />
        <div className={`commentInfo ${isEditing ? 'editing' : ''}`}>
            <h4>
                {user?.displayName}
                <span className='commentTimeStamp'>
                  {formattedTimestamp}
                </span>
            </h4>
            {isEditing ? (
              <div className='editTextBox'>
                <textarea
                  className='editCommentTextarea'
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                />
              </div>
            ) : (
              <p className='commentText'>{comment}</p>
            )}
        </div>
        <div className='commentActions'>
          {!isEditing && (
            <label className="customCheckbox">
              <input type="checkbox" className="commentCheckbox" onChange={handleCheckboxChange} />
              <span className="checkmark"></span>
            </label>
          )}
          {isEditing && (<SaveIcon onClick={handleSave} />)}
          {isEditing && (<CloseIcon className='closeIcon' onClick={handleClose} />)}
          {!isEditing && (<EditIcon onClick={handleEdit} />)}
          {!isEditing && (<DeleteIcon onClick={handleDelete} />)}
        </div>
    </div>
  )
}

export default CommentList