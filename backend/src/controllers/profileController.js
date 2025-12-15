import Joi from 'joi';
import Profile from '../models/Profile.js';

const profileSchema = Joi.object({
  full_name: Joi.string().required(),
  headline: Joi.string().allow(''),
  location: Joi.object({
    city: Joi.string(),
    country: Joi.string()
  }).allow(null),
  experience_years: Joi.number().integer().min(0).allow(null),
  skills: Joi.array().items(Joi.string()).allow(null),
  certifications: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    issuer: Joi.string(),
    date: Joi.date()
  })).allow(null),
  resume_url: Joi.string().uri().allow(''),
  preferences: Joi.object({
    job_types: Joi.array().items(Joi.string()),
    salary_range: Joi.object({
      min: Joi.number(),
      max: Joi.number()
    }),
    remote_work: Joi.boolean()
  }).allow(null)
});

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log('Update profile request:', req.user, req.body);
    const { error, value } = profileSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const profile = await Profile.upsert(req.user.id, value);
    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};