import React, { useEffect, useState } from 'react';
import './Sidebar.scss';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CollectionAddPopup from './CollectionAddPopup';
import PlayerAddPopup from './PlayerAddPopup';
import { auth, db } from '../../firebase';
import { useAppSelector } from '../../app/hooks';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/userSlice';
import useCollection from '../../hooks/useCollection';
import { CollectionReference, DocumentData, DocumentReference, QuerySnapshot, addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Button, Menu, MenuItem } from '@mui/material';
import CollectionIcon from './CollectionIcon';
import useSecondCollection from '../../hooks/useSecondCollection';
import Player from './Player';
import { setCollectionInfo } from '../../features/collectionSlice';
import { setPlayerInfo } from '../../features/playerSlice';
import CollectionEditPopup from './CollectionEditPopup';
import PlayerEditPopup from './PlayerEditPopup';

const Sidebar = () => {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const { documents: collections } = useCollection("collections");
  const { secondDocuments: players } = useSecondCollection("collections", "players");
  const [ collectionAddShowPopup, setCollectionAddShowPopup ] = useState(false); // コレクション作成ポップアップの表示状態を管理
  const [ collectionEditShowPopup, setCollectionEditShowPopup ] = useState(false); // コレクション編集ポップアップの表示状態を管理
  const [ playerAddShowPopup, setPlayerAddShowPopup ] = useState(false); // プレイヤー作成ポップアップの表示状態を管理
  const [ playerEditShowPopup, setPlayerEditShowPopup ] = useState(false); // プレイヤー編集ポップアップの表示状態を管理
  const [ selectedCollection, setSelectedCollection ] = useState<DocumentData | null>(null); // 選択されたコレクションの情報を管理
  const [ selectedPlayer, setSelectedPlayer ] = useState<DocumentData | null>(null); // 選択されたプレイヤーの情報を管理
  const [ showTimestamp, setShowTimestamp ] = useState(false); // タイムスタンプ（コレクション登録日）の表示状態を管理
  const [ showPlayer, setShowPlayer ] = useState(true); // プレイヤーの表示状態を管理
  const [ collectionsState, setCollectionsState ] = useState<DocumentData[]>([]); // コレクションの状態管理の変更

  // 右クリックメニューの表示状態を管理（コレクション情報）
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    collection: DocumentData | null;
  } | null>(null);

  // 右クリックメニューの表示状態を管理（プレイヤー情報）
  const [contextPlayerMenu, setContextPlayerMenu] = useState<{
    mouseX: number;
    mouseY: number;
    player: DocumentData | null;
  } | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  // コレクションの再取得関数の追加
  const fetchCollections = async () => {
    const collectionSnapshot = await getDocs(collection(db, "collections"));
    const collectionsList = collectionSnapshot.docs.map(doc => ({
      id: doc.id,
      collection: doc.data(),
    }));
    setCollectionsState(collectionsList);
  };

  // ログアウト関数
  const handleLogout = () => {
    const confirmed = window.confirm('ログアウトしてもよろしいですか？');
    if (confirmed) {
      auth.signOut()
        .then(() => {
          dispatch(logout());
        })
        .catch((error) => {
          console.error('Error signing out: ', error);
        }
      );
    }
  };

  // ネストされたコレクションを再帰的に削除する関数
  const deleteCollectionRecursively = async (collectionRef: CollectionReference<DocumentData>) => {
    const snapshot: QuerySnapshot<DocumentData> = await getDocs(collectionRef);
    const deletePromises = snapshot.docs.map(async (doc) => {
      const subCollections = await getDocs(collection(doc.ref, 'subCollectionName')); // 必要に応じてすべてのサブコレクションを取得
      for (const subCollection of subCollections.docs) {
        await deleteCollectionRecursively(collection(subCollection.ref, 'subCollectionName'));
      }
      await deleteDoc(doc.ref);
    });
    await Promise.all(deletePromises);
  };

  // ▼▼▼ コレクション ▼▼▼
  // コレクション選択関数
  const handleCollectionClick = (collection: DocumentData, afterEditFlg: boolean) => {
    if (collection.id != selectedCollection?.id || afterEditFlg) {
      setSelectedCollection(collection);
      dispatch(setCollectionInfo({
        collectionId: collection.id,
        title: collection.collection.title,
        category: collection.collection.category,
        imageUrl: collection.collection.imageUrl,
        timestamp: collection.collection.timestamp
      }));
      setSelectedPlayer(null);
      dispatch(setPlayerInfo({
        playerId: null,
        playerName: null,
        roleName: null,
        timestamp: null
      }));
      setShowTimestamp(false);
    }
  };

  // コレクション追加関数
  const addCollection = async (title: string, category: string, imageUrl: string) => {
    if (title) {
      const docRef = await addDoc(collection(db, "collections"), {
        title: title,
        category: category,
        imageUrl: imageUrl,
        timestamp: serverTimestamp(),
        user: user,
      });
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const newCollection = {
          id: docRef.id,
          collection: {
            title: title,
            category: category,
            imageUrl: imageUrl,
            timestamp: docSnap.data().timestamp,
            user: user,
          },
        };
        handleCollectionClick(newCollection, false);
      }
    }
  };

  // コレクション編集ポップアップを表示する関数
  const handleEditCollection = () => {
    if (contextMenu?.collection) {
      handleCollectionClick(contextMenu.collection, false); // 編集するコレクションを選択
      setCollectionEditShowPopup(true);
      handleClose(); // メニューを閉じる
    }
  };

  // コレクション編集関数
  const editCollection = async (id: string, title: string, category: string, imageUrl: string) => {
    if (id && title && category) {
      try {
        const collectionRef = doc(db, "collections", id);
        await updateDoc(collectionRef, {
          title: title,
          category: category,
          imageUrl: imageUrl,
        });
        await fetchCollections(); // 編集完了後にコレクションを再取得して更新
        // 編集後のコレクションを選択状態にする
        const updatedCollection = {
          id,
          collection: { title, category, imageUrl, timestamp: selectedCollection?.collection.timestamp }
        };
        handleCollectionClick(updatedCollection, true);
        setCollectionEditShowPopup(false);
      } catch (error) {
        console.error("コレクションの編集に失敗しました:", error);
      }
    }
  };

  // コレクション削除関数
  const handleDeleteCollection = async () => {
    if (contextMenu?.collection?.id) {
      const confirmed = window.confirm('このコレクションを削除してもよろしいですか？\n削除すると、コレクションが保持しているプレイヤー情報およびコメントもすべて削除されます。');
      if (confirmed) {
        try {
          const playersRef = collection(db, "collections", contextMenu.collection.id, "players");
          await deleteCollectionRecursively(playersRef); // ネストされたデータを再帰的に削除
          await deleteDoc(doc(db, "collections", contextMenu.collection.id));
          setContextMenu(null);

          // コレクションが選択されている場合、選択をクリアする
          if (selectedCollection?.id === contextMenu.collection.id) {
            setSelectedCollection(null);
            dispatch(setCollectionInfo({
              collectionId: null,
              title: null,
              category: null,
              imageUrl: null,
              timestamp: null
            }));
            setSelectedPlayer(null);
            dispatch(setPlayerInfo({
              playerId: null,
              playerName: null,
              roleName: null,
              timestamp: null
            }));
            setShowTimestamp(false);
          }
        } catch (error) {
          console.error('コレクションの削除に失敗しました:', error);
        }
      }
      handleClose();
    }
  };
  // ▲▲▲ コレクション ▲▲▲

  // ▼▼▼ プレイヤー ▼▼▼
  // プレイヤー選択関数
  const handlePlayerClick = (player: DocumentData) => {
    setSelectedPlayer(player);
    dispatch(setPlayerInfo({
      playerId: player.id,
      playerName: player.player.playerName,
      roleName: player.player.roleName,
      timestamp: player.player.timestamp
    }));
  };

  // プレイヤー追加関数
  const addPlayer = async (playerName: string, roleName: string) => {
    if (playerName) {
      const collectionRef: CollectionReference<DocumentData> = collection(
        db, 
        "collections", 
        String(selectedCollection?.id), 
        "players"
      );

      const docRef: DocumentReference<DocumentData> = await addDoc(
        collectionRef, 
        {
          playerName: playerName,
          roleName: roleName,
          timestamp: serverTimestamp(),
          user: user,
        }
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const newPlayer = {
          id: docRef.id,
          player: {
            playerName: playerName,
            roleName: roleName,
            timestamp: docSnap.data().timestamp,
            user: user,
          },
        };
        handlePlayerClick(newPlayer);
      }
    }
  };

  // プレイヤー編集ポップアップを表示する関数
  const handleEditPlayer = () => {
    if (contextPlayerMenu?.player) {
      handlePlayerClick(contextPlayerMenu.player);
      setPlayerEditShowPopup(true);
      handlePlayerClose();
    }
  };

  // プレイヤー編集関数
  const editPlayer = async (id: string, playerName: string, roleName: string) => {
    if (id && playerName && roleName) {
      try {
        const playerRef = doc(db, "collections", String(selectedCollection?.id), "players", id);
        await updateDoc(playerRef, {
          playerName: playerName,
          roleName: roleName,
        });
        await fetchCollections(); // 編集完了後にコレクションを再取得して更新
        // 編集後のプレイヤーを選択状態にする
        const updatedPlayer = {
          id,
          player: { playerName, roleName, timestamp: selectedPlayer?.player.timestamp }
        };
        handlePlayerClick(updatedPlayer);
        setPlayerEditShowPopup(false);
      } catch (error) {
        console.error("プレイヤーの編集に失敗しました:", error);
      }
    }
  };

  // プレイヤー削除関数
  const handleDeletePlayer = async () => {
    if (contextPlayerMenu?.player?.id) {
      const confirmed = window.confirm('このプレイヤーを削除してもよろしいですか？\n削除すると、プレイヤーが保持しているコメントもすべて削除されます。');
      if (confirmed) {
        try {
          const commentsRef = collection(db, "collections", String(selectedCollection?.id), "players", contextPlayerMenu.player.id, "comments");
          await deleteCollectionRecursively(commentsRef); // ネストされたデータを再帰的に削除
          await deleteDoc(doc(db, "collections", String(selectedCollection?.id), "players", contextPlayerMenu.player.id));
          setContextPlayerMenu(null);
          
          // プレイヤーが選択されている場合、選択をクリアする
          if (selectedPlayer?.id === contextPlayerMenu.player.id) {
            setSelectedPlayer(null);
            dispatch(setPlayerInfo({
              playerId: null,
              playerName: null,
              roleName: null,
              timestamp: null
            }));
          }
        } catch (error) {
          console.error('プレイヤーの削除に失敗しました:', error);
        }
      }
      handlePlayerClose();
    }
  };
  // ▲▲▲ プレイヤー ▲▲▲

  // ▼▼▼ 右クリック ▼▼▼
  // 右クリックメニューを開く関数（コレクション）
  const handleContextMenu = (event: React.MouseEvent, collection: DocumentData) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      collection: collection,
    });
  };

  // 右クリックメニューを閉じる関数（コレクション）
  const handleClose = () => {
    setContextMenu(null);
  };

  // 右クリックメニューを開く関数（プレイヤー）
  const handleContextPlayerMenu = (event: React.MouseEvent, player: DocumentData) => {
    event.preventDefault();
    setContextPlayerMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      player: player,
    });
  };

  // 右クリックメニューを閉じる関数（コレクション）
  const handlePlayerClose = () => {
    setContextPlayerMenu(null);
  };
  // ▲▲▲ 右クリック ▲▲▲

  // タイムスタンプを"YYYY/MM/DD"形式にする関数
  const formatTimestamp = (timestamp: any) => {
    const date = new Date(timestamp.seconds * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };
  
  return (
    <div className='sidebar'>
      {/* コレクション情報 */}
      <div className='sidebarLeft'>
        {collections.map((collection) => (
          <CollectionIcon 
            collection={collection} 
            id={collection.id} 
            key={collection.id} 
            onClick={() => handleCollectionClick(collection, false)}
            onContextMenu={(event: React.MouseEvent) => handleContextMenu(event, collection)}
            isSelected={selectedCollection?.id === collection.id}
          />
        ))}
        {/* コレクション追加 */}
        <div>
          <div className='collectionIcon'>
            <AddIcon onClick={() => setCollectionAddShowPopup(true)} />
          </div>
        </div>
      </div>
      {/* コレクション登録ポップアップ */}
      {collectionAddShowPopup && (
        <CollectionAddPopup 
          onClose={() => setCollectionAddShowPopup(false)} 
          onSave={addCollection} 
        />
      )}
      {/* コレクション編集ポップアップ */}
      {collectionEditShowPopup && selectedCollection && (
        <CollectionEditPopup 
          collection={selectedCollection}
          onClose={() => setCollectionEditShowPopup(false)} 
          onSave={editCollection} 
        />
      )}
      {/* 右クリックメニュー（コレクション） */}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleEditCollection}>編集</MenuItem>
        <MenuItem onClick={handleDeleteCollection}>削除</MenuItem>
      </Menu>
      {/* コレクション名 / プレイヤー情報 / アカウント情報 */}
      <div className='sidebarRight'>
        {/* コレクション名 */}
        <div className='saidebarRightTop'>
          {/* 選択されたコレクション名を表示 */}
          {selectedCollection && (
            <div className='collectionName'>
              <div className='collectionNameRow'>
                <h3>{selectedCollection.collection.title}</h3>
                {showTimestamp && <ExpandMoreIcon onClick={() => setShowTimestamp(!showTimestamp)} />}
                {!showTimestamp && <ChevronRightIcon onClick={() => setShowTimestamp(!showTimestamp)} />}
              </div>
              {showTimestamp && <span className='collectionCategory'>ジャンル：{selectedCollection.collection.category}</span>}
              {showTimestamp && <span>登録日：{formatTimestamp(selectedCollection.collection.timestamp)}</span>}
          </div>
          )}
        </div>
        {/* プレイヤー情報 */}
        <div className='saidebarRightCenter'>
          {/* コレクションが選択された場合に表示 */}
          {selectedCollection && (
            <div className='sidebarRightCenterTop'>
              <div className='sidebarRightCenterHeader'>
                {showPlayer && <ExpandMoreIcon onClick={() => setShowPlayer(!showPlayer)} />}
                {!showPlayer && <ChevronRightIcon onClick={() => setShowPlayer(!showPlayer)} />}
                <h4>プレイヤーリスト</h4>
              </div>
              {/* プレイヤー追加 */}
              <AddIcon 
                className='addPlayerIcon' 
                onClick={() => setPlayerAddShowPopup(true)} 
              />
            </div>
          )}
          {/* プレイヤー情報リスト */}
          {showPlayer && (
            <div className='playerList'>
              {players.map((player) => (
                <Player 
                  player={player}
                  id={player.id} 
                  key={player.id}
                  isSelected={selectedPlayer?.id === player.id}
                  onClick={() => handlePlayerClick(player)}
                  onContextMenu={(event: React.MouseEvent) => handleContextPlayerMenu(event, player)}
                />
              ))}
            </div>
          )}
        </div>
        {/* プレイヤー登録ポップアップ */}
        {playerAddShowPopup && (
          <PlayerAddPopup 
            onClose={() => setPlayerAddShowPopup(false)} 
            onSave={addPlayer} 
          />
        )}
        {/* プレイヤー編集ポップアップ */}
        {playerEditShowPopup && selectedPlayer && (
          <PlayerEditPopup 
            player={selectedPlayer}
            onClose={() => setPlayerEditShowPopup(false)} 
            onSave={editPlayer} 
          />
        )}
        {/* 右クリックメニュー（プレイヤー） */}
        <Menu
          open={contextPlayerMenu !== null}
          onClose={handlePlayerClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextPlayerMenu !== null
              ? { top: contextPlayerMenu.mouseY, left: contextPlayerMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleEditPlayer}>編集</MenuItem>
          <MenuItem onClick={handleDeletePlayer}>削除</MenuItem>
        </Menu>
        {/* アカウント情報 */}
        <div className='sidebarRightFooter'>
          <div className='accountInfo'>
            <img src={user?.photo} />
            <div className='accountName'>
              <h4>{user?.displayName}</h4>
              <Button onClick={handleLogout}>ログアウト</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar