import React from 'react'
import './CommentListFirst.scss';
import { Avatar } from '@mui/material';
import { Timestamp } from 'firebase/firestore';

type Props = {
    timestamp: Timestamp | null;
};

const CommentListFirst = (props: Props) => {
    const { timestamp } = props;
    const formattedTimestamp = timestamp ? new Date(timestamp.toDate()).toLocaleString() : 'Invalid Date';

  return (
    <div className='commentFirstInner'>
        <Avatar />
        <div className='commentFirstInfo'>
            <h4>
                Game Master's Letter
                <span className='commentTimeStamp'>
                    {formattedTimestamp}
                </span>
            </h4>
            <p>1、プレイヤーのロールプレイやストーリーについてのポジティブな感想をコメントしましょう</p>
            <p>2、最低3件のコメントをしましょう</p>
            <p>3、3件以上コメントすると「デジタルレターの文章を作成する」ボタンが表示されます</p>
            <p>4、デジタルレターの文章に採用が望ましいと思うコメントのチェックボックスに、最大3件までチェックしましょう</p>
            <p>5、チェックしてボタンをクリックすると、ゲームマスター（あなた）からプレイヤーへのデジタルレターの文章が届きます</p>
        </div>
    </div>
  )
}

export default CommentListFirst