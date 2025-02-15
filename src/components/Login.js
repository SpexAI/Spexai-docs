import { useState } from "react";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import PropTypes from "prop-types";

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const Input = styled.input`
  padding: ${(props) => props.theme.spacing.sm};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background: ${(props) => props.theme.colors.sidebar};
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.accent};
  }
`;

const Button = styled.button`
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.background};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.fontSizes.md};
  cursor: pointer;
  transition: opacity ${(props) => props.theme.transitions.fast};

  &:hover {
    opacity: 0.9;
  }

  ${(props) =>
    props.loading &&
    `
    opacity: 0.7;
    pointer-events: none;
  `}
`;

const ErrorMessage = styled.div`
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.fontSizes.sm};
  margin-top: ${(props) => props.theme.spacing.sm};
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password");
          break;
        default:
          setError("An error occurred during sign in");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <h1>Login</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </LoginContainer>
  );
}

Login.propTypes = {};

export default Login;
