const request = require('supertest');
const firebaseTesting = require('@firebase/rules-unit-testing');
const { hash } = require('@senecacdot/satellite');

const { app } = require('../../src/index');
const User = require('../../src/models/user');

// Utility functions
const clearData = () => firebaseTesting.clearFirestoreData({ projectId: 'telescope' });

const getUser = (id) => request(app).get(`/${id}`);

const getUsers = () => request(app).get('/');

const createUserHash = (email = 'galileo@email.com') => hash(email);

const createUser = async (editedUser = {}) => {
  const defaultUser = {
    firstName: 'Galileo',
    lastName: 'Galilei',
    email: 'galileo@email.com',
    displayName: 'Galileo Galilei',
    isAdmin: true,
    isFlagged: true,
    feeds: ['https://dev.to/feed/galileogalilei'],
    github: {
      username: 'galileogalilei',
      avatarUrl:
        'https://avatars.githubusercontent.com/u/7242003?s=460&u=733c50a2f50ba297ed30f6b5921a511c2f43bfee&v=4',
    },
  };

  // If the user sends use any user properties, override the default values.  If not, use default as is.
  const user = new User({ ...defaultUser, ...editedUser });
  const response = await request(app)
    .post(`/${user.id}`)
    .set('Content-Type', 'application/json')
    .send(user.toObject());

  // Return both the user object and the response, so we can compare the two.
  return { user, response };
};

// Tests
describe('Ensure environment variable(s) are set', () => {
  test('process.env.development === localhost:8088', () => {
    expect(process.env.FIRESTORE_EMULATOR_HOST).toEqual('localhost:8088');
  });
});

describe('GET REQUESTS', () => {
  beforeEach(clearData);

  test('Accepted - Get all users', async () => {
    const galileo = await createUser();
    const carl = await createUser({
      firstName: 'Carl',
      lastName: 'Sagan',
      email: 'carl@email.com',
      displayName: 'Carl Sagan',
      isAdmin: true,
      isFlagged: true,
      feeds: ['https://dev.to/feed/carlsagan'],
      github: {
        username: 'carlsagan',
        avatarUrl:
          'https://avatars.githubusercontent.com/u/7242003?s=460&u=733c50a2f50ba297ed30f6b5921a511c2f43bfee&v=4',
      },
    });

    expect(galileo.response.status).toBe(201);
    expect(carl.response.status).toBe(201);

    const response = await getUsers();
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body).toEqual([
      {
        firstName: 'Galileo',
        lastName: 'Galilei',
        email: 'galileo@email.com',
        displayName: 'Galileo Galilei',
        isAdmin: true,
        isFlagged: true,
        feeds: ['https://dev.to/feed/galileogalilei'],
        github: {
          username: 'galileogalilei',
          avatarUrl:
            'https://avatars.githubusercontent.com/u/7242003?s=460&u=733c50a2f50ba297ed30f6b5921a511c2f43bfee&v=4',
        },
      },
      {
        firstName: 'Carl',
        lastName: 'Sagan',
        email: 'carl@email.com',
        displayName: 'Carl Sagan',
        isAdmin: true,
        isFlagged: true,
        feeds: ['https://dev.to/feed/carlsagan'],
        github: {
          username: 'carlsagan',
          avatarUrl:
            'https://avatars.githubusercontent.com/u/7242003?s=460&u=733c50a2f50ba297ed30f6b5921a511c2f43bfee&v=4',
        },
      },
    ]);
  });

  test('Accepted - Get one user', async () => {
    const { user } = await createUser();
    const response = await getUser(user.id);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      firstName: 'Galileo',
      lastName: 'Galilei',
      email: 'galileo@email.com',
      displayName: 'Galileo Galilei',
      isAdmin: true,
      isFlagged: true,
      feeds: ['https://dev.to/feed/galileogalilei'],
      github: {
        username: 'galileogalilei',
        avatarUrl:
          'https://avatars.githubusercontent.com/u/7242003?s=460&u=733c50a2f50ba297ed30f6b5921a511c2f43bfee&v=4',
      },
    });
  });

  test('Rejected - Get a user which does not exist', async () => {
    const response = await getUser(createUserHash('no-such-user@nowhere.com'));
    expect(response.statusCode).toBe(404);
  });
});

describe('PUT REQUESTS', () => {
  beforeEach(clearData);

  test('Accepted - Update a user', async () => {
    const { user } = await createUser();
    const updated = {
      firstName: 'Galileo',
      lastName: 'Galilei',
      email: 'galileo@email.com',
      displayName: 'Sir Galileo Galilei',
      isAdmin: true,
      isFlagged: true,
      feeds: ['https://dev.to/feed/galileogalilei'],
      github: {
        username: 'galileogalilei',
        avatarUrl:
          'https://avatars.githubusercontent.com/u/7242003?s=460&u=733c50a2f50ba297ed30f6b5921a511c2f43bfee&v=4',
      },
    };

    const response = await request(app)
      .put(`/${user.id}`)
      .set('Content-Type', 'application/json')
      .send(updated);

    expect(response.statusCode).toBe(200);
  });

  test('Rejected - Update a nonexistent user', async () => {
    const user = new User({
      firstName: 'Carl',
      lastName: 'Sagan',
      email: 'carl@email.com',
      displayName: 'Carl Sagan',
      isAdmin: true,
      isFlagged: true,
      feeds: ['https://dev.to/feed/carlsagan'],
      github: {
        username: 'carlsagan',
        avatarUrl:
          'https://avatars.githubusercontent.com/u/7242003?s=460&u=733c50a2f50ba297ed30f6b5921a511c2f43bfee&v=4',
      },
    });

    const response = await request(app)
      .put(`/${user.id}`)
      .set('Content-Type', 'application/json')
      .send(user.toObject());

    expect(response.statusCode).toBe(404);
  });
});

describe('POST REQUESTS', () => {
  beforeEach(clearData);

  test('Accepted - Create a user', async () => {
    const { response } = await createUser();
    expect(response.statusCode).toBe(201);
  });

  test('Rejected - Create two of the same user', async () => {
    const { response: response1 } = await createUser();
    expect(response1.statusCode).toBe(201);

    const { response: response2 } = await createUser();
    expect(response2.statusCode).toBe(400);
  });

  test('Rejected - Ensure that the feeds array can only contain URI strings', async () => {
    const user = new User({
      firstName: 'Carl',
      lastName: 'Sagan',
      email: 'carl@email.com',
      displayName: 'Carl Sagan',
      isAdmin: true,
      isFlagged: true,
      feeds: ['123'],
      github: {
        username: 'carlsagan',
        avatarUrl:
          'https://avatars.githubusercontent.com/u/7242003?s=460&u=733c50a2f50ba297ed30f6b5921a511c2f43bfee&v=4',
      },
    });

    const response = await request(app)
      .post(`/${user.id}`)
      .set('Content-Type', 'application/json')
      .send(user.toObject());

    expect(response.statusCode).toBe(400);
  });

  test('Rejected - Ensure that user objects fail validation if properties are not valid or missing', async () => {
    const required = [
      'firstName',
      'lastName',
      'email',
      'displayName',
      'isAdmin',
      'isFlagged',
      'feeds',
    ];

    // Loop through all the required fields and try removing them and sending.  We expect 400s
    await Promise.all(
      required.map(async (property) => {
        const user = new User({
          firstName: 'Carl',
          lastName: 'Sagan',
          email: 'carl@email.com',
          displayName: 'Carl Sagan',
          isAdmin: true,
          isFlagged: true,
          feeds: ['https://dev.to/feed/carlsagan'],
          github: {
            username: 'carlsagan',
            avatarUrl:
              'https://avatars.githubusercontent.com/u/7242003?s=460&u=733c50a2f50ba297ed30f6b5921a511c2f43bfee&v=4',
          },
        });

        // Delete this property from the data we send
        const invalidData = user.toObject();
        invalidData[property] = null;

        const response = await request(app)
          .post(`/${user.id}`)
          .set('Content-Type', 'application/json')
          .send(invalidData);

        // Make sure we get back a 400
        expect(response.statusCode).toBe(400);
      })
    );
  });
});

describe('DELETE REQUESTS', () => {
  beforeEach(clearData);

  test('Accepted - Deleted a user', async () => {
    const { user } = await createUser();

    const response = await request(app)
      .delete(`/${user.id}`)
      .set('Content-Type', 'application/json');

    expect(response.statusCode).toBe(200);
  });

  test('Rejected - Deleted a nonexistent user', async () => {
    const id = createUserHash('no-such-user@email.com');
    const response = await request(app).delete(`/${id}`).set('Content-Type', 'application/json');

    expect(response.statusCode).toBe(404);
  });
});
