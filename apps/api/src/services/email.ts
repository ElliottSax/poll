import nodemailer from 'nodemailer'
import { prisma } from '../utils/prisma'
import { logger } from '../utils/logger'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export interface AlertEmailData {
  raceName: string
  oldValue: string
  newValue: string
  magnitude: number
  raceUrl: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    // Configure email transporter (SendGrid, AWS SES, etc.)
    if (process.env.SENDGRID_API_KEY) {
      // SendGrid configuration
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      })
    } else if (process.env.SMTP_HOST) {
      // Generic SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    } else {
      // Development: Log emails to console
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      })
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@pollingdashboard.com',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      })

      logger.info('Email sent:', info.messageId)
      return true
    } catch (error) {
      logger.error('Error sending email:', error)
      return false
    }
  }

  /**
   * Send race alert email
   */
  async sendRaceAlert(userId: string, data: AlertEmailData): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, displayName: true },
    })

    if (!user) return false

    const html = this.generateAlertEmail(data, user.displayName || 'there')

    return this.sendEmail({
      to: user.email,
      subject: `Race Alert: ${data.raceName} ${data.newValue}`,
      html,
    })
  }

  /**
   * Send new poll notification
   */
  async sendNewPollNotification(
    userId: string,
    raceId: string,
    poll: any
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, displayName: true },
    })

    if (!user) return false

    const race = await prisma.race.findUnique({
      where: { id: raceId },
      select: { raceName: true, slug: true },
    })

    if (!race) return false

    const html = this.generateNewPollEmail({
      userName: user.displayName || 'there',
      raceName: race.raceName,
      pollster: poll.pollster.name,
      pollDate: poll.pollDate,
      results: poll.results,
      raceUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/races/${race.slug}`,
    })

    return this.sendEmail({
      to: user.email,
      subject: `New Poll: ${race.raceName}`,
      html,
    })
  }

  /**
   * Send weekly digest
   */
  async sendWeeklyDigest(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, displayName: true, trackedRaces: true },
    })

    if (!user || user.trackedRaces.length === 0) return false

    // Get updates for tracked races
    const races = await prisma.race.findMany({
      where: { id: { in: user.trackedRaces } },
      include: {
        polls: {
          take: 5,
          orderBy: { pollDate: 'desc' },
          include: { pollster: true },
        },
        forecasts: {
          take: 1,
          orderBy: { forecastDate: 'desc' },
        },
      },
    })

    const html = this.generateWeeklyDigestEmail({
      userName: user.displayName || 'there',
      races,
    })

    return this.sendEmail({
      to: user.email,
      subject: 'Your Weekly Polling Digest',
      html,
    })
  }

  /**
   * Generate alert email HTML
   */
  private generateAlertEmail(data: AlertEmailData, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3182BD; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #3182BD; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Race Alert</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>There's an important update for a race you're following:</p>

            <div class="alert">
              <h2>${data.raceName}</h2>
              <p><strong>Rating Changed:</strong> ${data.oldValue} → ${data.newValue}</p>
              <p><strong>Magnitude:</strong> ${data.magnitude.toFixed(1)} point shift</p>
            </div>

            <p>
              <a href="${data.raceUrl}" class="button">View Race Details</a>
            </p>

            <p>Stay informed with real-time polling updates!</p>
          </div>
          <div class="footer">
            <p>You're receiving this because you subscribed to alerts for ${data.raceName}</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/settings/notifications">Manage Notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate new poll email HTML
   */
  private generateNewPollEmail(data: {
    userName: string
    raceName: string
    pollster: string
    pollDate: Date
    results: any
    raceUrl: string
  }): string {
    const resultsList = Object.entries(data.results)
      .map(([name, pct]) => `<li><strong>${name}:</strong> ${pct}%</li>`)
      .join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3182BD; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .poll-data { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 24px; background: #3182BD; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 New Poll Published</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>A new poll has been published for <strong>${data.raceName}</strong>:</p>

            <div class="poll-data">
              <p><strong>Pollster:</strong> ${data.pollster}</p>
              <p><strong>Date:</strong> ${new Date(data.pollDate).toLocaleDateString()}</p>
              <p><strong>Results:</strong></p>
              <ul>${resultsList}</ul>
            </div>

            <p><a href="${data.raceUrl}" class="button">View Full Details</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate weekly digest email
   */
  private generateWeeklyDigestEmail(data: { userName: string; races: any[] }): string {
    const racesList = data.races
      .map(
        (race) => `
        <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 5px;">
          <h3>${race.raceName}</h3>
          <p><strong>Latest Polls:</strong> ${race.polls.length} new polls this week</p>
          ${
            race.forecasts[0]
              ? `<p><strong>Forecast:</strong> ${JSON.stringify(race.forecasts[0].probabilities)}</p>`
              : ''
          }
        </div>
      `
      )
      .join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3182BD; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 Your Weekly Polling Digest</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>Here's what happened this week in the races you're following:</p>
            ${racesList}
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Convert HTML to plain text (simple version)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
  }
}

// Export singleton
export const emailService = new EmailService()
