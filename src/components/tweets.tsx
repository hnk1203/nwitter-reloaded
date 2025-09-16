import styled from "styled-components";
import type { ITweet } from "./timeline";
import { auth, db } from "../routes/firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div``;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const EditInput = styled.textarea`
  width: 100%;
  border: 1px solid #3cf975;
  background-color: transparent;
  color: white;
  padding: 10px;
  border-radius: 5px;
  resize: none;
  font-size: 16px;
  margin: 10px 0px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
`;

const EditButton = styled.button`
  background-color: #3cf975;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 5px;
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
`;

const CancelButton = styled.button`
  background-color: #777;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
`;

const AttachFileButton = styled.label`
  padding: 5px 10px;
  color: #3cf975;
  text-align: center;
  border-radius: 5px;
  border: 1px solid #3cf975;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const AttachFileInput = styled.input`
  display: none;
`;

const RemovePhotoButton = styled.button`
  padding: 5px 10px;
  background-color: tomato;
  color: white;
  border: 0;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const ImageEditContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export default function Tweet({
  username,
  fileData,
  tweet,
  userId,
  id,
}: ITweet) {
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTweet, setEditedTweet] = useState(tweet);

  // 수정 중인 이미지 파일을 Base64 문자열로 저장하는 상태
  // fileData가 undefined일 경우 null로 처리하여 타입 오류를 해결
  const [newFileData, setNewFileData] = useState<string | null>(
    fileData || null
  );

  const onDelete = async () => {
    const ok = confirm("삭제할까요?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
    } catch (e) {
      console.log(e);
    }
  };

  const onEdit = () => {
    setIsEditing(true);
  };

  const onSave = async () => {
    if (!editedTweet.trim() || user?.uid !== userId) return;
    try {
      await updateDoc(doc(db, "tweets", id), {
        tweet: editedTweet,
        fileData: newFileData,
      });
      setIsEditing(false);
    } catch (e) {
      console.log(e);
    }
  };

  const onCancel = () => {
    setIsEditing(false);
    setEditedTweet(tweet);
    setNewFileData(fileData || null); // 취소 시 원본 이미지로 되돌리기
  };

  const onTweetChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTweet(e.target.value);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      const file = files[0];
      if (file.size > 1024 * 1024) {
        alert("파일 크기는 1MB를 초과할 수 없습니다.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onRemovePhoto = () => {
    setNewFileData(null);
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        {isEditing ? (
          <>
            <EditInput value={editedTweet} onChange={onTweetChange} />
            <ButtonContainer>
              <SaveButton onClick={onSave}>저장</SaveButton>
              <CancelButton onClick={onCancel}>취소</CancelButton>
            </ButtonContainer>
          </>
        ) : (
          <>
            <Payload>{tweet}</Payload>
            {user?.uid === userId ? (
              <ButtonContainer>
                <DeleteButton onClick={onDelete}>삭제</DeleteButton>
                <EditButton onClick={onEdit}>수정</EditButton>
              </ButtonContainer>
            ) : null}
          </>
        )}
      </Column>
      <Column>
        {isEditing ? (
          <ImageEditContainer>
            {newFileData ? (
              <>
                <Photo src={newFileData} />
                <RemovePhotoButton onClick={onRemovePhoto}>
                  사진 삭제
                </RemovePhotoButton>
              </>
            ) : null}
            <AttachFileButton htmlFor={`edit-file-${id}`}>
              {newFileData ? "사진 변경" : "사진 추가"}
            </AttachFileButton>
            <AttachFileInput
              onChange={onFileChange}
              type="file"
              id={`edit-file-${id}`}
              accept="image/*"
            />
          </ImageEditContainer>
        ) : fileData ? (
          <Photo src={fileData} />
        ) : null}
      </Column>
    </Wrapper>
  );
}
