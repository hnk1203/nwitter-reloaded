import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth } from "./firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  Form,
  Error,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";

// 오류 메시지를 담은 객체의 이름을 변경
const authErrorMap = {
  "auth/email-already-in-use": "이미 존재하는 이메일입니다.",
  "auth/weak-password": "비밀번호는 6자리 이상이어야 합니다.",
  "auth/invalid-email": "올바른 이메일 형식이 아닙니다.",
};

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firebaseError, setFirebaseError] = useState(""); // 상태 변수 이름도 변경

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "name") {
      setName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFirebaseError("");
    if (
      isLoading ||
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      return;
    }

    try {
      setLoading(true);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(credentials.user, {
        displayName: name,
      });
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        // 에러 코드에 따라 메시지 매핑을 활용
        const mappedError = authErrorMap[e.code as keyof typeof authErrorMap];
        setFirebaseError(mappedError || e.message); // 매핑된 메시지가 없으면 기본 에러 메시지 사용
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Join ✖</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="name"
          value={name}
          placeholder="Name"
          type="text"
          required
        />
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="email"
          type="email"
          required
        />
        <Input
          onChange={onChange}
          name="password"
          value={password}
          placeholder="Password"
          type="password"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Loading...." : "Create Account"}
        />
      </Form>
      {firebaseError !== "" && <Error>{firebaseError}</Error>}
      <Switcher>
        이미 계정이 있습니까? <Link to="/login">Log In &rarr; </Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
