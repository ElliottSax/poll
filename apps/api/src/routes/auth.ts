import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { prisma } from '../utils/prisma'
import { config } from '../config/env'
import { verifyToken, optionalAuth } from '../middleware/auth'

const signupSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string()
    .min(8)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message: "Password must contain uppercase, lowercase, number, and special character"
    }),
  name: z.string().min(2).max(100).trim(),
})

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1).max(100),
})

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(100),
  newPassword: z.string()
    .min(8)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message: "Password must contain uppercase, lowercase, number, and special character"
    }),
})

export async function authRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Sign up
  fastify.post('/signup', {
    schema: {
      description: 'Create a new user account',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const data = signupSchema.parse(request.body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email },
        })

        if (existingUser) {
          return reply.status(409).send({
            error: 'Conflict',
            message: 'User with this email already exists',
          })
        }

        // Hash password
        const passwordHash = await hash(data.password, 12)

        // Create user
        const user = await prisma.user.create({
          data: {
            email: data.email,
            passwordHash,
            name: data.name,
            role: 'user',
            tier: 'free',
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            tier: true,
            createdAt: true,
          },
        })

        // Generate JWT
        const token = sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
            tier: user.tier,
          },
          config.jwtSecret,
          { expiresIn: '7d' }
        )

        return reply.status(201).send({
          user,
          token,
          expiresIn: 604800, // 7 days in seconds
        })
      } catch (error) {
        fastify.log.error(error)
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: error.errors,
          })
        }
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to create user account',
        })
      }
    },
  })

  // Login
  fastify.post('/login', {
    schema: {
      description: 'Login to user account',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const data = loginSchema.parse(request.body)

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: data.email },
        })

        if (!user || !user.passwordHash) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid email or password',
          })
        }

        // Verify password
        const isValidPassword = await compare(data.password, user.passwordHash)

        if (!isValidPassword) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid email or password',
          })
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        // Generate JWT
        const token = sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
            tier: user.tier,
          },
          config.jwtSecret,
          { expiresIn: '7d' }
        )

        return reply.send({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tier: user.tier,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
          },
          token,
          expiresIn: 604800, // 7 days in seconds
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to login',
        })
      }
    },
  })

  // Get current user (me)
  fastify.get('/me', {
    preHandler: [verifyToken],
    schema: {
      description: 'Get current authenticated user',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
    },
    handler: async (request, reply) => {
      try {
        const userId = request.user!.id

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            role: true,
            tier: true,
            createdAt: true,
            lastLoginAt: true,
            _count: {
              select: {
                savedRaces: true,
              },
            },
          },
        })

        if (!user) {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'User not found',
          })
        }

        return reply.send(user)
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to fetch user data',
        })
      }
    },
  })

  // Update profile
  fastify.patch('/profile', {
    preHandler: [verifyToken],
    schema: {
      description: 'Update user profile',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          bio: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const userId = request.user!.id
        const data = updateProfileSchema.parse(request.body)

        const user = await prisma.user.update({
          where: { id: userId },
          data,
          select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            role: true,
            tier: true,
            updatedAt: true,
          },
        })

        return reply.send(user)
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to update profile',
        })
      }
    },
  })

  // Change password
  fastify.post('/change-password', {
    preHandler: [verifyToken],
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes'
      }
    },
    schema: {
      description: 'Change user password',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const userId = request.user!.id
        const data = changePasswordSchema.parse(request.body)

        // Get current user
        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user || !user.passwordHash) {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'User not found',
          })
        }

        // Verify current password
        const isValidPassword = await compare(data.currentPassword, user.passwordHash)

        if (!isValidPassword) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Current password is incorrect',
          })
        }

        // Hash new password
        const newPasswordHash = await hash(data.newPassword, 12)

        // Update password
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash: newPasswordHash },
        })

        return reply.send({
          success: true,
          message: 'Password changed successfully',
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to change password',
        })
      }
    },
  })

  // Delete account
  fastify.delete('/account', {
    preHandler: [verifyToken],
    schema: {
      description: 'Delete user account',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
    },
    handler: async (request, reply) => {
      try {
        const userId = request.user!.id

        // Delete user (cascading deletes will handle related records)
        await prisma.user.delete({
          where: { id: userId },
        })

        return reply.status(204).send()
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to delete account',
        })
      }
    },
  })

  // Refresh token
  fastify.post('/refresh', {
    preHandler: [verifyToken],
    schema: {
      description: 'Refresh authentication token',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
    },
    handler: async (request, reply) => {
      try {
        const user = request.user!

        // Generate new JWT
        const token = sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
            tier: user.tier,
          },
          config.jwtSecret,
          { expiresIn: '7d' }
        )

        return reply.send({
          token,
          expiresIn: 604800,
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to refresh token',
        })
      }
    },
  })
}
