const { PrismaClient } = require("@prisma/client");
const createError = require("http-errors");

const db = new PrismaClient();

// Creating a new user will also create a new cart and associated with it in the database.
const registerUser = async (req, res, next) => {
  const { phone, email, password, name } = req.body;
  try {
    if (!phone || !email || !password || !name) {
      return next(createError(422, "Missing information"));
    }
    const userExists = await db.user.findFirst({
      where: { OR: [{ phone }, { email }] },
    });
    if (userExists) {
      return next(
        createError(400, "User already exists with provided phone or email.")
      );
    } else {
      const user = await db.user.create({
        data: { phone, email, password, name },
      });
      const cart = await db.cart.create({
        data: { userId: user.id },
      });
      res.send({
        message: "User registered successfully",
        user: user,
      });
    }
  } catch (error) {
    console.log(error);
    next(createError(500, "Internal server error"));
  }
};

const loginUser = async (req, res, next) => {
  const { phone, password } = req.body;
  try {
    if (!phone || !password) {
      return next(createError(422, "Phone or password is missing"));
    }
    const user = await db.user.findFirst({ where: { phone } });
    if (!user) {
      return next(createError(422, "User not found"));
    }
    if (user && user.password !== password) {
      return next(createError(422, "Incorrect password"));
    }
    res.send({
      message: "Logged in successfully",
      data: {
        user: user,
        token: "##Token##",
      },
    });
  } catch (error) {
    console.log(error);
    next(createError(500, "Internal server error"));
  }
};

const findById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return next(createError(422, "Id is required"));
    }
    // do not include cart items
    const user = await db.user.findUnique({
      where: { id },
      include: { cart: { include: { cartItem: true } } },
    });
    if (!user) {
      return next(createError(422, "user not found"));
    }
    res.send({ message: "User found successfully", data: user });
  } catch (error) {
    console.log(error);
    next(createError(500, "Internal server error"));
  }
};

module.exports = { registerUser, findById, loginUser };
