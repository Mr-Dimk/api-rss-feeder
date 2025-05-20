import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

/**
 * Webhook Model
 * { id, callbackUrl, subscriptionIds }
 */

export const webhookSchema = Joi.object({
  callbackUrl: Joi.string().uri().required(),
  subscriptionIds: Joi.array().items(
    Joi.string().guid({ version: 'uuidv4' })
  ).min(1).required(),
});

export function createWebhook({ callbackUrl, subscriptionIds }) {
  return {
    id: uuidv4(),
    callbackUrl,
    subscriptionIds,
  };
}

export function validateWebhook(data) {
  return webhookSchema.validate(data);
}
