import { User } from '@src/models/user';
import { response } from 'express';

describe('Users functional tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('When create a new user', () => {
    it('shound successfully create new a user', async () => {
      const newUser = {
        name: 'john Doe',
        email: 'john@email.com',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newUser));
    });

    it('should return 422 when there is a validation error', async () => {
      const newUser = {
        email: 'john@email.com',
        password: '1234',
      };
      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('Should return 409 then the email already exists', async () => {
      const newUser = {
        name: 'john Doe',
        email: 'john@email.com',
        password: '1234',
      };

      await global.testRequest.post('/users').send(newUser);
      const response =  await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'User validation failed: email: already exists in the database.'
      });
    });
  });
});
