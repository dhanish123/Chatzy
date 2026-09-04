import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { useAuthStore } from '../stores/authStore.js';
import { authAPI } from '../services/api.js';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { setUser, setToken, setLoading, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      setToken(response.data.token);
      setUser(response.data.user);
      navigate('/');
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({ form: 'Invalid email or password' });
      } else {
        setErrors({ form: 'Login failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Chatzy</h1>
        <h2 className="text-2xl font-semibold text-center mb-6">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && <div className="bg-red-100 text-red-700 p-3 rounded">{errors.form}</div>}

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            showPasswordToggle
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};
