import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../routes/firebase";
import Tweet from "./tweets";
import type { Unsubscribe } from "firebase/auth";

export interface ITweet {
  id: string;
  fileData?: string;
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
}

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

export default function Timeline() {
  const [tweets, setTweets] = useState<ITweet[]>([]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    const fetchTweets = async () => {
      const tweetsQuery = query(
        collection(db, "tweets"),
        orderBy("createdAt", "desc"),
        limit(25)
      );
      // const spanshot = await getDocs(tweetsQuery);
      // const tweets = spanshot.docs.map((doc) => {
      //   const { tweet, createdAt, userId, username, fileData } = doc.data();
      //   return {
      //     tweet,
      //     createdAt,
      //     userId,
      //     username,
      //     fileData,
      //     id: doc.id,
      //   };
      // });
      //db 및 쿼리와 실시간 연결을 하는거
      unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
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
        return () => {
          unsubscribe && unsubscribe();
        };
      });
    };
    fetchTweets();
  }, []);
  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </Wrapper>
  );
}
