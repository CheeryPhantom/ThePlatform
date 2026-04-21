import Joi from 'joi';
import { User } from '../models/User.js';

// Password policy: min 8 chars, at least one uppercase letter, one digit,
// one special char. Mirrored on the frontend Register component.
const strongPassword = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/\d/, 'digit')
  .pattern(/[!@#$%^&*(),.?":{}|<>_\-\[\]\\/`~+=;']/, 'special')
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must be at most 128 characters',
    'string.pattern.name': 'Password must contain at least one {#name}'
  });

const registerSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  password: strongPassword,
  name: Joi.string().trim().min(2).max(120).required(),
  role: Joi.string().valid('candidate', 'employer', 'admin').default('candidate')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const existingUser = await User.findByEmail(value.email);
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const user = await User.create(value);
    const token = User.generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findByEmail(value.email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await User.verifyPassword(value.password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = User.generateToken(user);

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};