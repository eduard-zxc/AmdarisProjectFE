import { useAuth } from '../components/Auth/AuthProvider';

const LoginPage = () => {
  const { loginWithRedirect } = useAuth();

  return (
    <div>
      <h2>Login</h2>
      <button onClick={() => loginWithRedirect()}>Login with Auth0</button>
    </div>
  );
};

export default LoginPage;