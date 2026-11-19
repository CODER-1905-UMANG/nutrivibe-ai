
import { useState } from 'react';
import { loginUser, registerUser } from './services/authService';
import { Leaf, Lock, Mail, User } from 'lucide-react';
import './Auth.css';

function Auth({ onAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (isLogin) {
        const result = await loginUser({
          email: normalizedEmail,
          password,
        });

        onAuthenticated(result.user);
      } else {
        await registerUser({
          name: name.trim(),
          email: normalizedEmail,
          password,
        });

        // Log in automatically after successful registration.
        const result = await loginUser({
          email: normalizedEmail,
          password,
        });

        onAuthenticated(result.user);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsLogin((current) => !current);
    setError('');
    setName('');
    setPassword('');
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon">
            <Leaf size={25} />
          </span>

          <span>
            nutri<span>vibe</span>
            <small>HEALTH, MADE PERSONAL</small>
          </span>
        </div>

        <div className="auth-heading">
          <h1>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </h1>

          <p>
            {isLogin
              ? 'Sign in to continue your health journey.'
              : 'Start building healthier habits with NutriVibe.'}
          </p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label>
              Full name

              <span className="auth-input-wrap">
                <User size={18} />

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  required
                />
              </span>
            </label>
          )}

          <label>
            Email address

            <span className="auth-input-wrap">
              <Mail size={18} />

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </span>
          </label>

          <label>
            Password

            <span className="auth-input-wrap">
              <Lock size={18} />

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                minLength={8}
                required
              />
            </span>
          </label>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}

          <button type="button" onClick={switchMode}>
            {isLogin ? 'Create account' : 'Sign in'}
          </button>
        </p>

        <p className="auth-footer">
          Your journey to healthier living starts here.
        </p>
      </section>
    </main>
  );
}

export default Auth;
