import styled from "styled-components";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  //resize : 텍스트박스 안움직거리게 만들어주는거
  resize: none;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const AttachFileButton = styled.label`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const AttachFileInput = styled.input`
  display: none;
`;

const SubmitBtn = styled.input``;

export default function PostTweetForm() {
  return (
    <Form>
      <TextArea placeholder="무슨일이야" />
      <AttachFileButton htmlFor="file">Add photo</AttachFileButton>
      <AttachFileInput type="file" id="file" accept="image/*" />
      <SubmitBtn type="submit" value="작성" />
    </Form>
  );
}
