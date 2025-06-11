import { useAuth } from '../components/Auth/AuthProvider';

const RegisterPage = () => {
  const { loginWithRedirect } = useAuth();

  const handleRegister = () => {
    loginWithRedirect({
      screen_hint: 'signup',
    });
  };

  return (
    <div>
      <h2>Register</h2>
      <button onClick={handleRegister}>Register with Auth0</button>
    </div>
  );
};

export default RegisterPage;