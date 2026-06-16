import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

interface AuthCardProps {
  onAuthSuccess: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [login] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data: any) => {
      localStorage.setItem('token', data.login.token);
      onAuthSuccess();
    },
    onError: (err: any) => {
      setErrorMsg(err.message);
    },
  });

  const [register] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data: any) => {
      localStorage.setItem('token', data.register.token);
      onAuthSuccess();
    },
    onError: (err: any) => {
      setErrorMsg(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLogin) {
      if (!email || !password) {
        setErrorMsg('Please fill in all fields.');
        return;
      }
      login({ variables: { email, password } });
    } else {
      if (!name || !email || !password) {
        setErrorMsg('Please fill in all fields.');
        return;
      }
      register({ variables: { name, email, password } });
    }
  };

  return (
    <div className="cute-card" style={{ maxWidth: '400px', margin: '60px auto 20px' }}>
      <h2 className="cute-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          className={`cute-btn ${isLogin ? 'cute-btn-primary' : 'cute-btn-secondary'}`}
          style={{ flex: 1 }}
          onClick={() => {
            setIsLogin(true);
            setErrorMsg('');
          }}
        >
          Login
        </button>
        <button
          className={`cute-btn ${!isLogin ? 'cute-btn-primary' : 'cute-btn-secondary'}`}
          style={{ flex: 1 }}
          onClick={() => {
            setIsLogin(false);
            setErrorMsg('');
          }}
        >
          Sign Up
        </button>
      </div>

      {errorMsg && <div className="error-badge">⚠️ {errorMsg}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {!isLogin && (
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Name</label>
            <input
              type="text"
              className="cute-input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email</label>
          <input
            type="email"
            className="cute-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Password</label>
          <input
            type="password"
            className="cute-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="cute-btn cute-btn-primary" style={{ marginTop: '10px' }}>
          {isLogin ? 'Log In' : 'Register'}
        </button>
      </form>
    </div>
  );
};
