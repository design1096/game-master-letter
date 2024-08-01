import React from 'react'
import './CommentListFirst.scss';
import { Avatar } from '@mui/material';
import { Timestamp } from 'firebase/firestore';

type Props = {
    id: string;
    timestamp: Timestamp | null;
    letterBody: string;
};

const LetterBody = (props: Props) => {
    const { id, letterBody, timestamp } = props;
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
            <p className='commentText'>{letterBody}</p>
        </div>
    </div>
  )
}

export default LetterBody