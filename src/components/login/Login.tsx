import React from 'react'
import './Login.scss';
import { Button } from '@mui/material';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../firebase';

const Login = () => {
    // Googleでログイン
    const signIn = () => {
        signInWithPopup(auth, provider).catch((err) => {
            alert(err.message);
        });
    };

  return (
    <div className='login'>
        <div className='title'>
            Game Master's Letter
        </div>
        <div className='description'>
            ゲームマスターからプレイヤーに贈るデジタルレター
        </div>
        <Button onClick={signIn}>Googleアカウントで利用する</Button>
    </div>
  )
}

export default Login