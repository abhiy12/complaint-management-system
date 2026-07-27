const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT) || 587,
  secure: Number(env.SMTP_PORT) === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined
});

async function sendMail({ to, subject, html, text }) {
  try {
    await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html, text });
  } catch (err) {
    // Email failures should never crash a request; log and move on.
    logger.error(`Mail send failed to ${to}: ${err.message}`);
  }
}

module.exports = { sendMail };
