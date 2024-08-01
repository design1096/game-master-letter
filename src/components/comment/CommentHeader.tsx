import React from 'react'
import './CommentHeader.scss';

type Props = {
  playerName: string | null;
  roleName: string | null,
};

const CommentHeader = (props: Props) => {
  const { playerName, roleName } = props;

  return (
    <div className='commentHeader'>
        <div className='commentHeaderLeft'>
          <h3>
            <span className='commentHeaderHash'>#</span>
            {playerName}（ {roleName} ）さんへのコメントを書き込もう
          </h3>
        </div>
    </div>
  )
}

export default CommentHeader