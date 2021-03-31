// This is our User "schema" that we use when creating a new user
const { hash } = require('@senecacdot/satellite');
const User = require('../src/models/user');

describe('User Model', () => {
  const data = {
    firstName: 'Carl',
    lastName: 'Sagan',
    email: 'carl@email.com',
    displayName: 'Carl Sagan',
    isAdmin: true,
    isFlagged: true,
    feeds: ['https://carl.blog.com/feed'],
    github: {
      username: 'carlsagan',
      avatarUrl:
        'https://avatars.githubusercontent.com/u/7242003?s=460&u=733c50a2f50ba297ed30f6b5921a511c2f43bfee&v=4',
    },
  };

  test('constructor should populate all expected properties', () => {
    const user = new User(data);
    // Loop over all the key/value properties in data, and compare with what's in user
    Object.entries(data).map(([key, value]) => expect(user[key]).toEqual(value));
  });

  test('id should return the hashed email in the form we expect', () => {
    const user = new User(data);
    const expectedId = hash(data.email);
    expect(user.id).toEqual(expectedId);
  });

  test('toObject() should return a regular JS object', () => {
    const user = new User(data);
    const o = user.toObject();
    expect(typeof o === 'object').toBe(true);
    // Make sure this object doesn't have its own custom prototype
    expect(Object.getPrototypeOf(o) === Object.prototype).toBe(true);
  });

  test('should be able to round-trip a user through toObject() and ctor', () => {
    const user1 = new User(data);
    const user2 = new User(user1.toObject());
    expect(user1).toEqual(user2);
  });
});
