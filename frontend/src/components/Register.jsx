import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Check, Briefcase, Building, CheckCircle } from 'lucide-react';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordRequirements = [
    { key: 'length', label: 'Minimum 8 characters', regex: /.{8,}/ },
    { key: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
    { key: 'number', label: 'One number', regex: /\d/ },
    { key: 'special', label: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  const getPasswordStrength = (password) => {
    const metRequirements = passwordRequirements.filter(req => req.regex.test(password)).length;
    if (metRequirements <= 1) return 'weak';
    if (metRequirements <= 3) return 'medium';
    return 'strong';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const strength = getPasswordStrength(formData.password);
      if (strength === 'weak') {
        newErrors.password = 'Password is too weak';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.email, formData.password, formData.name, formData.role);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Join The Platform</h1>
          <p className="register-subtitle">Create your account to get started</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="role-selection">
            <label className="role-selection-label">I am a</label>
            <div className="role-options">
              <div
                className={`role-option ${formData.role === 'candidate' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('candidate')}
              >
                <div className="role-option-checkmark">
                  <Check size={12} />
                </div>
                <div className="role-option-icon">
                  <Briefcase size={24} />
                </div>
                <div className="role-option-title">Job Seeker</div>
                <div className="role-option-description">I'm looking for jobs</div>
              </div>

              <div
                className={`role-option ${formData.role === 'employer' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('employer')}
              >
                <div className="role-option-checkmark">
                  <Check size={12} />
                </div>
                <div className="role-option-icon">
                  <Building size={24} />
                </div>
                <div className="role-option-title">Employer</div>
                <div className="role-option-description">I'm hiring</div>
              </div>
            </div>
            {errors.role && <div className="error-message">{errors.role}</div>}
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {formData.password && (
              <div className="password-strength">
                <div className="password-strength-bar">
                  <div className={`password-strength-fill ${passwordStrength}`}></div>
                </div>
                <div className="password-requirements">
                  {passwordRequirements.map(req => (
                    <div key={req.key} className={`requirement ${req.regex.test(formData.password) ? 'met' : ''}`}>
                      <CheckCircle size={12} className="icon" />
                      {req.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          {/* Terms Checkbox */}
          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="terms-text">
              I agree to the{' '}
              <a href="#" className="terms-link">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="terms-link">Privacy Policy</a>
            </label>
          </div>
          {errors.terms && <div className="error-message">{errors.terms}</div>}

          {/* Submit Error */}
          {errors.submit && <div className="error-message">{errors.submit}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className={`register-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{width: '20px', height: '20px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="register-footer">
          <p className="register-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="register-footer-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;