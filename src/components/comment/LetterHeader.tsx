import React from 'react'
import './CommentHeader.scss';

type Props = {
  playerName: string | null;
  roleName: string | null,
};

const LetterHeader = (props: Props) => {
    const { playerName, roleName } = props;

    return (
      <div className='commentHeader'>
          <div className='commentHeaderLeft'>
            <h3>
              <span className='commentHeaderHash'>#</span>
              {playerName}（ {roleName} ）さんへのデジタルレターを作成しよう
            </h3>
          </div>
      </div>
    )
}

export default LetterHeader