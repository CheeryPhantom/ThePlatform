import Joi from 'joi';
import { db } from '../db.js';
import Badge from '../models/Badge.js';

const progressSchema = Joi.object({
  percent_complete: Joi.number().integer().min(0).max(100).required(),
  progress: Joi.object().unknown(true).allow(null)
});

const enrollSchema = Joi.object({
  course_id: Joi.string().uuid().required()
});

const STALE_DAYS = 3;

export const listCourses = async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM training_courses ORDER BY created_at DESC LIMIT 100`
    );
    res.json({ courses: result.rows });
  } catch (err) {
    console.error('listCourses err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const myEnrollments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, c.title, c.provider, c.external_url, c.skills_covered
         FROM training_enrollments e
         LEFT JOIN training_courses c ON c.id = e.course_id
        WHERE e.user_id = $1
        ORDER BY e.last_activity_at DESC NULLS LAST`,
      [req.user.id]
    );
    res.json({ enrollments: result.rows });
  } catch (err) {
    console.error('myEnrollments err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Enrollments where the user has not touched the course in N days
 * and has not completed or unenrolled; used for the "Continue learning" card.
 */
export const myStaleEnrollments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, c.title, c.provider, c.external_url
         FROM training_enrollments e
         LEFT JOIN training_courses c ON c.id = e.course_id
        WHERE e.user_id = $1
          AND e.status = 'enrolled'
          AND e.percent_complete < 100
          AND (e.reminder_snoozed_until IS NULL OR e.reminder_snoozed_until < now())
          AND e.last_activity_at < now() - INTERVAL '${STALE_DAYS} days'
        ORDER BY e.last_activity_at ASC
        LIMIT 10`,
      [req.user.id]
    );
    res.json({ stale: result.rows, threshold_days: STALE_DAYS });
  } catch (err) {
    console.error('staleEnrollments err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const enroll = async (req, res) => {
  try {
    const { error, value } = enrollSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await db.query(
      `INSERT INTO training_enrollments (course_id, user_id, percent_complete, status, last_activity_at)
       VALUES ($1, $2, 0, 'enrolled', now())
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [value.course_id, req.user.id]
    );
    if (result.rows.length === 0) {
      const existing = await db.query(
        `SELECT * FROM training_enrollments WHERE course_id = $1 AND user_id = $2`,
        [value.course_id, req.user.id]
      );
      return res.json({ enrollment: existing.rows[0] });
    }
    res.status(201).json({ enrollment: result.rows[0] });
  } catch (err) {
    console.error('enroll err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { error, value } = progressSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const isCompleted = value.percent_complete === 100;
    const result = await db.query(
      `UPDATE training_enrollments
          SET percent_complete = $1,
              progress = COALESCE($2::jsonb, progress),
              last_activity_at = now(),
              status = CASE WHEN $1 = 100 THEN 'completed' ELSE status END,
              completed_at = CASE WHEN $1 = 100 AND completed_at IS NULL THEN now() ELSE completed_at END
        WHERE id = $3 AND user_id = $4
        RETURNING *`,
      [
        value.percent_complete,
        value.progress ? JSON.stringify(value.progress) : null,
        req.params.id,
        req.user.id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Enrollment not found' });

    const enrollment = result.rows[0];

    if (isCompleted) {
      const course = await db.query(`SELECT title FROM training_courses WHERE id = $1`, [
        enrollment.course_id
      ]);
      await Badge.award(req.user.id, {
        badge_key: `course.${enrollment.course_id}`,
        label: course.rows[0]?.title || 'Training Course',
        tier: 'silver',
        source: 'training',
        source_id: enrollment.id,
        description: 'Completed a training course on The Platform'
      });
    }

    res.json({ enrollment });
  } catch (err) {
    console.error('updateProgress err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const snoozeReminder = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.body.days, 10) || 3, 1), 30);
    const result = await db.query(
      `UPDATE training_enrollments
          SET reminder_snoozed_until = now() + ($1 || ' days')::INTERVAL,
              reminders_sent = reminders_sent + 1
        WHERE id = $2 AND user_id = $3
        RETURNING *`,
      [String(days), req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Enrollment not found' });
    res.json({ enrollment: result.rows[0] });
  } catch (err) {
    console.error('snoozeReminder err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
