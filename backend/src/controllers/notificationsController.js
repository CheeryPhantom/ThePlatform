import Joi from 'joi';
import Notification from '../models/Notification.js';

const markReadSchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).max(100).required()
}).unknown(false);

export const list = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const [items, unread] = await Promise.all([
      Notification.listForUser(req.user.id, { limit }),
      Notification.unreadCount(req.user.id)
    ]);
    res.json({ notifications: items, unread_count: unread });
  } catch (err) {
    console.error('notifications list err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markRead = async (req, res) => {
  try {
    const { error, value } = markReadSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const ids = await Notification.markRead(req.user.id, value.ids);
    res.json({ marked: ids });
  } catch (err) {
    console.error('notifications markRead err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.markAllRead(req.user.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('notifications markAllRead err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
