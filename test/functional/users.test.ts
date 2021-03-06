import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Users functional tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('When create a new user', () => {
    it('shound successfully create new a user with encrypted password', async () => {
      const newUser = {
        name: 'john Doe',
        email: 'john@email.com',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      await expect(
        AuthService.comparePasswords(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) },
        })
      );
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
      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'User validation failed: email: already exists in the database.',
      });
    });
  });

  describe('When authenticating a user', () => {
    it('Should generate a token for a valid user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@email.com',
        password: '1234',
      };

      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });

      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('Should return UNAUTHORIZAD if the user with given email is not found', async () => {
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: 'some-email@email.com', password: '1234' });

        expect(response.status).toBe(401);
    });

    it('Should return ANAUTHORIZAD if the user is found but the password does not match', async () => {

      const newUser = {
        name: 'John Doe',
        email: 'john@email.com',
        password: '1234',
      };
      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: 'different password' });

        expect(response.status).toBe(401);
    });
  });
});
