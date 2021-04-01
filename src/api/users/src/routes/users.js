const { Router, createError } = require('@senecacdot/satellite');
const { errors } = require('celebrate');
const { validateId, validateUser } = require('../models/celebrateSchema');
const User = require('../models/user');
const db = require('../services/firestore');

const router = Router();

// get a user with a supplied id, validated by the celebrateSchema
// rejected if a user could not be found, otherwise user returned
router.get('/:id', validateId(), async (req, res, next) => {
  const { id } = req.params;

  try {
    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      next(createError(404, `user ${id}) not found.`));
    } else {
      res.status(200).json(doc.data());
    }
  } catch (err) {
    next(err);
  }
});

// get all users
// rejected if the user collection is empty, otherwise users returned
router.get('/', async (req, res, next) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      next(createError(404, `no users found.`));
    } else {
      const users = snapshot.docs.map((doc) => doc.data());
      res.status(200).json(users);
    }
  } catch (err) {
    next(err);
  }
});

// post a user with supplied info, validated by the celebrateSchema
// rejected if a user already exists with that id, otherwise user created
router.post('/:id', validateId(), validateUser(), async (req, res, next) => {
  const { id } = req.params;

  try {
    const userRef = db.collection('users').doc(`${id}`);
    const doc = await userRef.get();

    if (doc.exists) {
      next(createError(400, `User with id ${id} already exists.`));
    } else {
      const user = new User(req.body);
      await db.collection('users').doc(id).set(user.toObject());
      res.status(201).json({ msg: `Added user with id: ${id}` });
    }
  } catch (err) {
    next(err);
  }
});

// put (update) a user with a supplied id, validated by the celebrateSchema
// rejected if a user could not be found, otherwise user updated
router.put('/:id', validateId(), validateUser(), async (req, res, next) => {
  const { id } = req.params;

  try {
    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      next(createError(404, `user ${id}) not found.`));
    } else {
      const user = new User(req.body);
      await db.collection('users').doc(id).update(user.toObject());
      res.status(200).json({ msg: `Updated user ${id}` });
    }
  } catch (err) {
    next(err);
  }
});

// delete a user with a supplied id, validated by the celebrateSchema
// rejected if a user could not be found, otherwise user deleted
router.delete('/:id', validateId(), async (req, res, next) => {
  const { id } = req.params;

  try {
    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      next(createError(404, `user ${id}) not found.`));
    } else {
      await db.collection('users').doc(id).delete();
      res.status(200).json({
        msg: `User ${id} was removed.`,
      });
    }
  } catch (err) {
    next(err);
  }
});

router.use(errors());

module.exports = router;
