import { app } from '@/app'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Users (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
    // Give time for connections to close properly
    await new Promise((resolve) => setTimeout(resolve, 500))
  })

  describe('POST /users', () => {
    it('should be able to register a new user', async () => {
      const response = await request(app.server).post('/users').send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'Password123!',
      })

      expect(response.status).toBe(201)
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user.email).toBe('johndoe@example.com')
    })
  })

  describe('POST /sessions', () => {
    it('should authenticate with valid credentials', async () => {
      // Register user first
      await request(app.server).post('/users').send({
        name: 'Auth User',
        email: 'auth@example.com',
        password: 'Password123!',
      })

      const response = await request(app.server).post('/sessions').send({
        email: 'auth@example.com',
        password: 'Password123!',
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
    })
  })

  describe('GET /me', () => {
    it('should return user profile with valid token', async () => {
      // Register and login
      await request(app.server).post('/users').send({
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'Password123!',
      })

      const authResponse = await request(app.server).post('/sessions').send({
        email: 'profile@example.com',
        password: 'Password123!',
      })

      const token = authResponse.body.token

      const response = await request(app.server).get('/me').set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.user.email).toBe('profile@example.com')
    })
  })

  describe('PUT /me', () => {
    it('should update user profile', async () => {
      await request(app.server).post('/users').send({
        name: 'Update Test',
        email: 'update@example.com',
        password: 'Password123!',
      })

      const authResponse = await request(app.server).post('/sessions').send({
        email: 'update@example.com',
        password: 'Password123!',
      })

      const token = authResponse.body.token

      const response = await request(app.server)
        .put('/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
        })

      expect(response.status).toBe(200)
      expect(response.body.user.name).toBe('Updated Name')
    })
  })

  describe('PUT /me/password', () => {
    it('should update password', async () => {
      await request(app.server).post('/users').send({
        name: 'Password Test',
        email: 'password@example.com',
        password: 'OldPassword123!',
      })

      const authResponse = await request(app.server).post('/sessions').send({
        email: 'password@example.com',
        password: 'OldPassword123!',
      })

      const token = authResponse.body.token

      const response = await request(app.server)
        .put('/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!',
        })

      expect(response.status).toBe(200)

      const newAuthResponse = await request(app.server).post('/sessions').send({
        email: 'password@example.com',
        password: 'NewPassword456!',
      })

      expect(newAuthResponse.status).toBe(200)
    })
  })
})
