import Joi from 'joi';
import Profile from '../models/Profile.js';
import { resolveLocation } from '../routes/locations.js';

const NAME_LIMIT = 60;
const HEADLINE_LIMIT = 160;
const ADDRESS_LINE_LIMIT = 200;
const SKILL_LIMIT = 40;
const MAX_SKILLS = 25;
const NEPAL_PHONE_RE = /^(\+?977[-\s]?)?9[67][0-9]{8}$/;

const preferencesSchema = Joi.object({
  employment_types: Joi.array()
    .items(Joi.string().valid('full_time', 'part_time', 'contract', 'internship', 'freelance', 'temporary'))
    .unique()
    .max(6)
    .default([]),
  work_modes: Joi.array()
    .items(Joi.string().valid('remote', 'hybrid', 'on_site'))
    .unique()
    .max(3)
    .default([]),
  willing_to_relocate: Joi.boolean().default(false),
  availability_date: Joi.date().iso().allow(null, ''),
  notice_period_days: Joi.number().integer().min(0).max(180).allow(null),
  expected_salary: Joi.object({
    currency: Joi.string().valid('NPR', 'USD', 'INR').default('NPR'),
    min: Joi.number().min(0).allow(null),
    max: Joi.number().min(0).allow(null),
    period: Joi.string().valid('month', 'year').default('month')
  })
    .custom((value, helpers) => {
      if (value?.min != null && value?.max != null && value.max < value.min) {
        return helpers.error('any.invalid', { message: 'max salary must be >= min' });
      }
      return value;
    })
    .allow(null),
  preferred_industries: Joi.array().items(Joi.string().max(60)).max(10).default([]),
  preferred_company_sizes: Joi.array()
    .items(Joi.string().valid('1-10', '11-50', '51-200', '201-1000', '1000+'))
    .unique()
    .max(5)
    .default([]),
  open_to_work: Joi.boolean().default(false)
}).unknown(false);

const profileSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(NAME_LIMIT).required(),
  middle_name: Joi.string().trim().min(1).max(NAME_LIMIT).allow('', null),
  last_name: Joi.string().trim().min(1).max(NAME_LIMIT).required(),
  headline: Joi.string().trim().max(HEADLINE_LIMIT).allow('', null),
  phone: Joi.string().trim().pattern(NEPAL_PHONE_RE).allow('', null).messages({
    'string.pattern.base': 'Phone must be a valid Nepali mobile (e.g. 98XXXXXXXX or +977-98XXXXXXXX)'
  }),
  date_of_birth: Joi.date().iso().less('now').allow(null, ''),
  gender: Joi.string().valid('female', 'male', 'non_binary', 'prefer_not_to_say').allow(null, ''),

  province_code: Joi.string().allow(null, ''),
  district_code: Joi.string().allow(null, ''),
  municipality_code: Joi.string().allow(null, ''),
  ward_number: Joi.number().integer().min(1).max(35).allow(null, ''),
  address_line: Joi.string().trim().max(ADDRESS_LINE_LIMIT).allow('', null),
  postal_code: Joi.string().trim().max(10).allow('', null),
  country_code: Joi.string().length(2).uppercase().default('NP'),

  experience_years: Joi.number().integer().min(0).max(60).allow(null, ''),

  skills: Joi.array()
    .items(Joi.string().trim().min(1).max(SKILL_LIMIT))
    .unique((a, b) => a.toLowerCase() === b.toLowerCase())
    .max(MAX_SKILLS)
    .default([]),

  linkedin_url: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
  github_url: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
  portfolio_url: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),

  preferred_title: Joi.string().trim().max(HEADLINE_LIMIT).allow('', null),
  availability: Joi.string().valid('immediate', 'within_2_weeks', 'within_1_month', 'within_3_months', 'not_looking').allow(null, ''),
  work_authorization: Joi.string().valid('np_citizen', 'np_permanent_resident', 'foreign_work_permit', 'student_visa', 'other').allow(null, ''),

  preferences: preferencesSchema.allow(null)
}).unknown(false);

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findByUserId(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { error, value } = profileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: false,
      convert: true
    });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => ({ path: d.path.join('.'), message: d.message }))
      });
    }

    try {
      resolveLocation({
        province_code: value.province_code || null,
        district_code: value.district_code || null,
        municipality_code: value.municipality_code || null
      });
    } catch (locErr) {
      return res.status(400).json({ error: locErr.message });
    }

    const computed = {
      ...value,
      full_name: [value.first_name, value.middle_name, value.last_name]
        .filter((s) => typeof s === 'string' && s.trim().length)
        .join(' ')
    };

    const profile = await Profile.upsert(req.user.id, computed);
    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const profileSchemaForTests = profileSchema;
