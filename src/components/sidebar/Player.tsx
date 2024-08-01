import React from 'react'
import './Player.scss';
import { DocumentData } from 'firebase/firestore';
import { useAppDispatch } from '../../app/hooks';
import { setPlayerInfo } from '../../features/playerSlice';

type Props = {
  id: string;
  player: DocumentData;
  isSelected: boolean;
  onClick: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
};

const Player = (props: Props) => {
    const { id, player, isSelected, onClick, onContextMenu } = props;
    const dispatch = useAppDispatch();
    
  return (
    <div className='player' onClick={onClick} onContextMenu={onContextMenu}>
      <h4 className={`playerInfo ${isSelected ? 'selected' : ''}`}>
        <span className='playerHash'>#</span>
        {player.player.playerName}（ {player.player.roleName} ）
      </h4>
    </div>
  )
}

export default Player