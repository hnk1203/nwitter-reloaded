import styled from "styled-components";
import { auth, db } from "./firebase";
import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth"; // updateProfile 함수를 import 합니다.

import type { ITweet } from "../components/timeline";
import Tweet from "../components/tweets";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;
const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
  cursor: pointer;
`;
const SaveButton = styled.button`
  background-color: #3f51b5;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [name, setName] = useState(user?.displayName ?? "익명");

  // 컴포넌트가 처음 로드될 때 Firestore에서 아바타 불러오기
  useEffect(() => {
    const fetchAvatar = async () => {
      if (user) {
        const docRef = doc(db, "avatars", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAvatar(data.photoURL);
        }
      }
    };
    fetchAvatar();
  }, [user]);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      const file = files[0];
      if (file.size > 1024 * 1024) {
        alert("파일 크기는 1MB를 초과할 수 없습니다.");
        return;
      }
      setNewFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSave = async () => {
    if (!user || !newFile || loading) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileData = reader.result as string;
        const userDocRef = doc(db, "avatars", user.uid);
        await setDoc(userDocRef, { photoURL: fileData });

        setAvatar(fileData);
        setNewFile(null);

        alert("프로필 사진이 성공적으로 업데이트되었습니다.");
      };
      reader.readAsDataURL(newFile);
    } catch (e) {
      console.error("Error updating avatar: ", e);
      alert("프로필 사진 업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 닉네임 변경 함수
  const onChangeNick = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newName = prompt("새로운 닉네임을 입력하세요.");
    if (!newName || newName.trim() === "" || newName === user.displayName)
      return;

    try {
      // 1. Firebase Authentication 닉네임 업데이트
      await updateProfile(user, { displayName: newName });

      // 2. 사용자가 작성한 모든 트윗을 찾습니다.
      const tweetsCollectionRef = collection(db, "tweets");
      const q = query(tweetsCollectionRef, where("userId", "==", user.uid));
      const userTweetsSnapshot = await getDocs(q);

      // 3. 각 트윗을 반복하며 username 필드를 업데이트합니다.
      const updatePromises = userTweetsSnapshot.docs.map((docSnapshot) => {
        const tweetDocRef = doc(db, "tweets", docSnapshot.id);
        return updateDoc(tweetDocRef, { username: newName });
      });

      // 4. 모든 업데이트가 완료될 때까지 기다립니다.
      await Promise.all(updatePromises);

      // 5. 컴포넌트 상태를 업데이트해서 화면에 즉시 반영합니다.
      setName(newName);
      alert("닉네임 업데이트 완려어오.");
    } catch (e) {
      console.error("닉네임 변경 실패:", e);
      alert("닉네임 변경에 실패했습니다.");
    }
  };

  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, fileData } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        fileData,
        id: doc.id,
      };
    });
    setTweets(tweets);
  };

  // 닉네임 변경 시 즉시 반영되도록 useEffect에 name도 추가
  useEffect(() => {
    fetchTweets();
  }, [user, name]);

  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </AvatarUpload>
      <AvatarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      <Name onClick={onChangeNick}>{name}</Name>
      {newFile && (
        <SaveButton onClick={onSave}>
          {loading ? "저장 중..." : "프로필 저장"}
        </SaveButton>
      )}
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
