import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const Auth = ({ user, onAuthChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Вход
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Регистрация
        await createUserWithEmailAndPassword(auth, email, password);
        // Имя можно сохранить в профиле пользователя позже, если нужно
      }
    } catch (err) {
      setError(err.message);
      if (err.code === 'auth/email-already-in-use') {
        setError('Этот email уже зарегистрирован');
      } else if (err.code === 'auth/invalid-email') {
        setError('Неверный формат email');
      } else if (err.code === 'auth/weak-password') {
        setError('Пароль должен содержать минимум 6 символов');
      } else if (err.code === 'auth/user-not-found') {
        setError('Пользователь не найден');
      } else if (err.code === 'auth/wrong-password') {
        setError('Неверный пароль');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Вы вошли как</h2>
          <p style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#667eea' }}>
            {user.email}
          </p>
          <button onClick={handleLogout} className="btn btn-danger">
            Выйти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '10px', 
              background: '#fee', 
              color: '#c33', 
              borderRadius: '5px',
              marginBottom: '15px'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{ width: '100%', marginBottom: '15px' }}
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setEmail('');
            setPassword('');
            setName('');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#667eea',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
