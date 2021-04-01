const { celebrate, Joi, Segments } = require('celebrate');

// Generate a display name if none given
const generateDisplayName = (parent) => `${parent.firstName} ${parent.lastName}`;

const validateId = () =>
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().hex().required(),
    },
  });

const validateUser = () =>
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      displayName: Joi.string().default(generateDisplayName),
      isAdmin: Joi.boolean().default(false),
      isFlagged: Joi.boolean().default(false),
      feeds: Joi.array().items(Joi.string().uri()).required(),
      github: Joi.object({
        username: Joi.string(),
        avatarUrl: Joi.string().uri(),
      }).and('username', 'avatarUrl'),
    }),
  });

exports.validateUser = validateUser;
exports.validateId = validateId;
