// This is our User "schema" that we use when creating a new user
const { hash } = require('@senecacdot/satellite');

class User {
  constructor(data) {
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.displayName = data.displayName || `${this.firstName} ${this.lastName}`;
    this.isAdmin = data.isAdmin === true;
    this.isFlagged = data.isFlagged === true;
    this.feeds = data.feeds;

    // Legacy users won't have GitHub info
    if (data.github) {
      this.github = data.github;
    }
  }

  // A user's id is the hash of their email, using the Satellite hash() function.
  get id() {
    return hash(this.email);
  }

  // Convenience for creating an Object Firestore can consume (i.e, can't
  // be an object with a prototype).
  toObject() {
    const user = {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
      isAdmin: this.isAdmin,
      isFlagged: this.isFlagged,
      feeds: this.feeds,
    };

    // Only include github if it's populated
    if (this.github) {
      user.github = this.github;
    }

    return user;
  }
}

module.exports = User;
