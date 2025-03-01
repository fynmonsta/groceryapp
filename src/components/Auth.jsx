import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-button">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        <button 
          type="button" 
          onClick={signInWithGoogle}
          className="google-button"
        >
          Sign in with Google
        </button>

        <p className="auth-switch">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="switch-button"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {auth.currentUser && (
          <button 
            type="button" 
            onClick={handleSignOut}
            className="signout-button"
          >
            Sign Out
          </button>
        )}
      </form>
    </div>
  );
}

export default Auth; 