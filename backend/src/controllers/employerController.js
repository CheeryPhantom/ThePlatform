import Joi from 'joi';
import Employer from '../models/Employer.js';

const employerSchema = Joi.object({
  company_name: Joi.string().required(),
  website: Joi.string().uri().allow(''),
  bio: Joi.string().allow('')
});

export const getEmployerProfile = async (req, res) => {
  try {
    const profile = await Employer.findByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Get employer profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEmployerProfile = async (req, res) => {
  try {
    console.log('Update employer profile request:', req.user, req.body);
    const { error, value } = employerSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const profile = await Employer.upsert(req.user.id, value);
    res.json(profile);
  } catch (error) {
    console.error('Update employer profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};