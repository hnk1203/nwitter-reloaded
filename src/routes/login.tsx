import { useState } from "react";
import { auth } from "./firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Form,
  Error,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";

// Rename the error map to avoid a name collision
const authErrorMap = {
  "auth/invalid-email": "유효하지 않은 이메일입니다.",
  "auth/user-not-found": "존재하지 않는 사용자입니다.",
  "auth/wrong-password": "비밀번호가 올바르지 않습니다.",
};

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  // Remove the 'name' state as it's not used in login
  // const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Rename the state variable for clarity
  const [loginError, setLoginError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    if (isLoading || email === "" || password === "") {
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        // Use the new error map to get a localized message
        const mappedError = authErrorMap[e.code as keyof typeof authErrorMap];
        setLoginError(mappedError || e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Log in ✖</Title>
      <Form onSubmit={onSubmit}>
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
        <Input type="submit" value={isLoading ? "Loading...." : "Log In"} />
      </Form>
      {loginError !== "" && <Error>{loginError}</Error>}
      <Switcher>
        회원이 아닙니까? <Link to="/create-account">Create one &rarr;</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
