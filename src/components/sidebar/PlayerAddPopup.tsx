import React, { useState } from 'react';
import './PlayerAddPopup.scss';

type Props = {
  onClose: () => void;
  onSave: (playerName: string, roleName: string) => void;
};


const PlayerAddPopup: React.FC<Props> = ({ onClose, onSave }) => {
  const [playerName, setPlayerName] = useState('');
  const [roleName, setRoleName] = useState('');

  // 登録ボタン押下時処理
  const handleSave = () => {
    if (!playerName || !roleName) {
      alert('プレイヤー名と作品の役名は、入力必須項目です。');
      return;
    }
    onSave(playerName, roleName);
    onClose();
  };

  return (
    <div className="popup">
      <div className="popupContent">
        <h2>新しいプレイヤーを登録</h2>
        <div className='inputField'>
          <label>プレイヤー名 <span className="required">*</span></label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
        <div className='inputField'>
          <label>作品の役名 <span className="required">*</span></label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>
        <div className="popupActions">
          <button className="saveButton" onClick={handleSave}>登録</button>
          <button className="cancelButton" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}

export default PlayerAddPopup