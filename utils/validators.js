const Joi = require('joi');

const UserSchema = Joi.object({
  name: Joi.string().min(2).max(32).required().error(new Error('Invalid User Name [Require 2-32 characters]')),
  email: Joi.string().email().max(128).error(new Error('Invalid Email Format [Must be valid email format & less than 128 characters]')),
  password: Joi.string().min(3).max(128).error(new Error('Invalid Password Format [Require 3-128 characters]')),
});

const AppSchema = Joi.object({
  name: Joi.string().min(2).max(5).required().error(new Error('Invalid App Name [Require 2-32 characters]')),
  description: Joi.string().max(128).error(new Error('Invalid Description [Must be less than 128 characters]')),
  contact_email: Joi.string().email().max(128).error(new Error('Invalid Email Format [Must be email address format & less than 128 characters]')),
  default_icon: Joi.string().max(256).error(new Error('Invalid Notification Icon [Must be less less than 256 characters]')),
});

const ChannelSchema = Joi.object({
  name: Joi.string().min(2).max(32).required().error(new Error('Invalid Channel Name [Require 2-32 characters]')),
});

const NotificationlSchema = Joi.object({
  name: Joi.string().min(2).max(32).required().error(new Error('Invalid Notification Name [Require 2-32 characters]')),
  title: Joi.string().required().error(new Error('Notification title is required')),
  body: Joi.string().required().error(new Error('Notification body is required')),
  icon: Joi.string().max(256).error(new Error('Invalid Notification Icon [Must be less less than 256 characters]')),
  sendType: Joi.string().valid('websocket', 'webpush').required().error(new Error('Invalid Send Type [Must be "webpush" or "websocket"]')),
  sendTime: Joi.string().isoDate().error(new Error('Invalid Send Time Format [Must be ISO 8601 date format]')),
  config: Joi.alternatives(Joi.string(), Joi.object()).error(new Error('Invalid Config Format [Must be string or JSON object]')),
});

module.exports = {
  UserSchema,
  AppSchema,
  ChannelSchema,
  NotificationlSchema,
};
