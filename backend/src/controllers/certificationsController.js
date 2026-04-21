import Joi from 'joi';
import Certification from '../models/Certification.js';
import Badge from '../models/Badge.js';
import { getCatalog, getCertification, tierForCatalog } from '../data/certificationsCatalog.js';

const TRUSTED_ISSUERS = new Set([
  'HarvardX (edX)',
  'freeCodeCamp',
  'Meta (Coursera)',
  'Google (Coursera)',
  'IBM (Coursera)',
  'DeepLearning.AI (Coursera)',
  'DeepLearning.AI + Stanford (Coursera)',
  'AWS Skill Builder',
  'Google Cloud Skills Boost',
  'Microsoft Learn',
  'Kaggle Learn',
  'HubSpot Academy',
  'Cisco Networking Academy',
  'University of Helsinki'
]);

const submitSchema = Joi.object({
  catalog_slug: Joi.string().allow(null, ''),
  title: Joi.string().trim().min(2).max(160).required(),
  issuer: Joi.string().trim().min(2).max(120).required(),
  issue_date: Joi.date().iso().max('now').allow(null, ''),
  expiry_date: Joi.date().iso().allow(null, ''),
  credential_url: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
  credential_id: Joi.string().trim().max(120).allow('', null),
  proof_file_id: Joi.string().uuid().allow(null, ''),
  skills_covered: Joi.array().items(Joi.string().max(40)).max(20).default([]),
  notes: Joi.string().max(500).allow('', null)
}).unknown(false);

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const listCatalog = (_req, res) => {
  const catalog = getCatalog();
  res.json({
    tiers: catalog.meta.tiers,
    certifications: catalog.certifications
  });
};

export const listMine = async (req, res) => {
  try {
    const certs = await Certification.listForUser(req.user.id);
    res.json({ certifications: certs });
  } catch (err) {
    console.error('listMine error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submit = async (req, res) => {
  try {
    const { error, value } = submitSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => ({ path: d.path.join('.'), message: d.message }))
      });
    }

    const catalogEntry = value.catalog_slug ? getCertification(value.catalog_slug) : null;
    const tier = catalogEntry ? catalogEntry.tier : tierForCatalog(value.catalog_slug);

    const autoVerifiable =
      Boolean(value.credential_url) &&
      (TRUSTED_ISSUERS.has(value.issuer) ||
        (catalogEntry && catalogEntry.verifiable));
    const status = autoVerifiable ? 'auto_verified' : 'pending';

    const created = await Certification.create(req.user.id, {
      ...value,
      tier,
      status
    });

    if (status === 'auto_verified') {
      await Badge.award(req.user.id, {
        badge_key: catalogEntry ? `cert.${catalogEntry.slug}` : `cert.${slugify(value.title)}`,
        label: catalogEntry ? catalogEntry.title : value.title,
        tier,
        source: 'certification',
        source_id: created.id,
        icon: catalogEntry ? catalogEntry.category : null,
        description: catalogEntry ? `Awarded for completing ${catalogEntry.title}` : null
      });
    }

    res.status(201).json({ certification: created });
  } catch (err) {
    console.error('submit cert error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req, res) => {
  try {
    const cert = await Certification.delete(req.user.id, req.params.id);
    if (!cert) return res.status(404).json({ error: 'Not found' });
    await Badge.revokeForSource(req.user.id, 'certification', cert.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('remove cert error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
