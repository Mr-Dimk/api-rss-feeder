import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

/**
 * FeedItem Model
 * { id, content, pubDate, subscriptionId }
 */

export const feedItemSchema = Joi.object({
  content: Joi.string().required(),
  pubDate: Joi.date().iso().required(),
  subscriptionId: Joi.string().guid({ version: 'uuidv4' }).required(),
});

export function createFeedItem({ content, pubDate, subscriptionId }) {
  return {
    id: uuidv4(),
    content,
    pubDate,
    subscriptionId,
  };
}

export function validateFeedItem(data) {
  return feedItemSchema.validate(data);
}
