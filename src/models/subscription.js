import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

/**
 * Subscription Model
 * { id, feedUrl, frequency }
 */

// Joi schema for validation
export const subscriptionSchema = Joi.object({
  feedUrl: Joi.string().uri().required(),
  frequency: Joi.number().integer().min(1).max(1440).required(), // in minutes
});

// Create a new subscription object
export function createSubscription({ feedUrl, frequency }) {
  return {
    id: uuidv4(),
    feedUrl,
    frequency,
  };
}

// Validate subscription input
export function validateSubscription(data) {
  return subscriptionSchema.validate(data);
}
