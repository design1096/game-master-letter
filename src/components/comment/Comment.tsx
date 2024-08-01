import React, { useEffect, useRef, useState } from 'react'
import './Comment.scss';
import CommentHeader from './CommentHeader';
import CommentList from './CommentList';
import { useAppSelector } from '../../app/hooks';
import SendIcon from '@mui/icons-material/Send';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, CollectionReference, DocumentData } from 'firebase/firestore';
import useThirdCollection from '../../hooks/useThirdCollection';
import useThirdTwoCollection from '../../hooks/useThirdTwoCollection';
import CommentListFirst from './CommentListFirst';
import { Button } from '@mui/material';
import axios from 'axios';
import LetterBody from './LetterBody';

const Comment = () => {
  const [inputText, setInputText] = useState<string>("");
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const user = useAppSelector((state) => state.user.user);
  const collectionId = useAppSelector((state) => state.collection.collectionId); // コレクションID
  const collectionTitle = useAppSelector((state) => state.collection.title); // コレクションの作品名
  const collectionCategory = useAppSelector((state) => state.collection.category); // コレクションのジャンル
  const playerId = useAppSelector((state) => state.player.playerId); // プレイヤーID
  const playerName = useAppSelector((state) => state.player.playerName); // プレイヤー名
  const playertTimestamp = useAppSelector((state) => state.player.timestamp); // プレイヤー登録日
  const roleName = useAppSelector((state) => state.player.roleName); // 役名
  const { thirdDocuments: comments } = useThirdCollection("collections", "players", "comments"); // コメント
  const { thirdTwoDocuments: letters } = useThirdTwoCollection("collections", "players", "letters"); // レター
  const commentListRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false); // 日本語入力の変換中かどうかを判定
  const MAX_TEXT_LENGTH = 1000; // 文字数最大値
  const ZERO = 0;
  const THREE = 3;

  // ▼▼▼ デジタルレター作成 ▼▼▼
  // コレクションIDまたはプレイヤーIDが変更されたときに選択したコメントをクリア
  useEffect(() => {
    setSelectedComments([]);
  }, [collectionId, playerId]);

  // コメント選択関数
  const handleCommentSelect = (comment: string, isChecked: boolean) => {
    setSelectedComments(prevState =>
      isChecked ? [...prevState, comment] : prevState.filter(c => c !== comment)
    );
  };

  // OpenAI APIを呼び出す関数
  const generateLetter = async () => {
    if (selectedComments.length == ZERO) {
      alert("コメントは1件以上選択してください。");
      return;
    }
    if (selectedComments.length > THREE) {
      alert("コメントは最大3件まで選択できます。");
      return;
    }

    const prompt = `私の名前はゲームマスターの${user?.displayName}です。
    プレイヤーの${playerName}さんへの素敵な手紙を書いてください。
    手紙はカジュアルでポジティブなトーンで、以下のポイントを含めてください。

    【手紙の体裁について】
    - 文章の始まりに「${user?.displayName}様」は不要。
    - 日本語で書くこと。
    - 最後に感謝の言葉を添えること。
    - 文章の長さは便箋1枚程度（300文字以内）に収めること。

    【手紙の内容について】
    - 一緒に遊んだゲームのジャンルは「${collectionCategory}」で、作品名は「${collectionTitle}」である。
    - ${playerName}さんが演じた役割は${roleName}である。
    - 下記の【ゲーム中に書き残したコメント】は、プレイ中に私がゲームマスター視点で感じたプレイヤーの${playerName}さんへ向けたコメントである。
    - コメントを用いて、${playerName}さんのロールプレイやストーリーについての感想を共有したい。

    【ゲーム中に書き残したコメント】
    - ${selectedComments.join('\n- ')}`;

    // API呼び出し
    try {
      // const res = await axios.post('http://localhost:3001/api/generate-letter', { prompt: prompt });
      const res = await axios.post('https://us-central1-game-master-letter.cloudfunctions.net/app/api/generate-letter', { prompt: prompt });
      registerLetterBody(res.data.text);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // OpenAI APIから受け取ったテキストを登録する関数
  const registerLetterBody = async(props: string) => {
    if (collectionId && playerId) {
      try {
        const docRef = await addDoc(collection(
          db, 
          "collections", 
          collectionId, 
          "players", 
          playerId, 
          "letters"
        ), {
          letterBody: props,
          timestamp: serverTimestamp(),
          user: user,
        });
      } catch (error) {
        console.error("レター本文の登録に失敗しました: ", error);
      }
    } else {
      console.error("collectionIdまたはplayerIdがnullです");
    }
  };
  // ▲▲▲ デジタルレター作成 ▲▲▲

  // コメント登録関数
  const registerComment = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (inputText.trim() === "") {
      alert("コメントを入力してください。");
      return;
    }

    if (inputText.length > MAX_TEXT_LENGTH) {
      alert(`コメントは最大${MAX_TEXT_LENGTH}文字までです。`);
      return;
    }

    if (!collectionId || !playerId) {
      alert("コレクションIDまたはプレイヤーIDが見つかりません。");
      return;
    }

    try {
      // Firestore にメッセージを登録
      const docRef = await addDoc(collection(
        db, 
        "collections", 
        collectionId, 
        "players", 
        playerId, 
        "comments"
      ), {
        comment: inputText,
        timestamp: serverTimestamp(),
        user: user,
      });
      setInputText("");
    } catch (error) {
      console.error("コメントの登録に失敗しました: ", error);
    }
  };

  // コメント編集→保存関数
  const handleSaveComment = async (id: string, newComment: string) => {
    if (collectionId && playerId) {
      const commentRef = doc(db, "collections", collectionId, "players", playerId, "comments", id);
      await updateDoc(commentRef, {
        comment: newComment,
        timestamp: serverTimestamp(),
      });
      // 必要に応じてコメントリストを再取得する処理を追加
    } else {
      console.error("collectionIdまたはplayerIdがnullです");
    }
  };

  // コメント削除関数
  const deleteComment = async (commentId: string) => {
    const commentDocRef = doc(db, "collections", String(collectionId), "players", String(playerId), "comments", commentId);
    await deleteDoc(commentDocRef);
  };

  // アイコンのクリック関数
  const handleIconClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    registerComment(e as unknown as React.FormEvent<HTMLFormElement>);
  };

  // コメントエリアのスクロール位置を一番下に
  useEffect(() => {
    if (commentListRef.current) {
      commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
    }
  }, [comments]);

  // playerId が null の場合は何も表示しない
  if (!playerId) {
    return (
      <div className='comment'></div>
    );
  };

  // キー操作の関数
  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isComposing) {
      event.preventDefault();
      registerComment(event as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className='comment'>
      {/* コメントヘッダー */}
      <CommentHeader playerName={playerName} roleName={roleName} />
      {/* コメントリスト */}
      <div className='commentList' ref={commentListRef}>
        <CommentListFirst timestamp={playertTimestamp}/>
        {comments.map((comment) => (
          <CommentList
            key={comment.id} 
            id={comment.id}
            comment={comment.comment} 
            timestamp={comment.timestamp}
            user={comment.user} 
            onDelete={() => deleteComment(comment.id)}
            onSelect={handleCommentSelect}
            onSave={handleSaveComment}
          />
        ))}
        {/* コメントが3件以上かつレターが0件の場合にボタンを表示 */}
        {comments.length >= THREE && letters.length === ZERO && (
          <div className='commentButton'>
            <Button className='createLetterTxtBtn' onClick={generateLetter}>デジタルレターの文章を作成する</Button>
          </div>
        )}
        {/* レターが存在する場合 */}
        {letters.map((letter) => (
          <LetterBody 
            key={letter.id} 
            id={letter.id}
            letterBody={letter.letterBody}
            timestamp={letter.timestamp}
          />
        ))}
      </div>
      {/* コメント送信 */}
      <div className='commentInput'>
        <form onSubmit={registerComment}>
          <textarea
            value={inputText}
            placeholder={`# ${playerName}（${roleName}）さんへのコメントを送信`} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              setInputText(e.target.value)
            }
            onKeyDown={handleKeyPress} // エンターキーとシフト＋エンターキーの処理を追加
            onCompositionStart={() => setIsComposing(true)} // 変換開始
            onCompositionEnd={() => setIsComposing(false)} // 変換終了
            rows={1}
          />
          <button 
            type='submit' 
            className='commentInputButton'
            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => 
              registerComment(e)}
          >
            送信
          </button>
          <div className='commentInputIcons' onClick={handleIconClick}>
            <SendIcon />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Comment