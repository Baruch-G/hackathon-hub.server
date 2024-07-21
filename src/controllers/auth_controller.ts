import { Request, Response } from "express";
import User, { IUser } from "../models/user_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Document } from "mongoose";
import Joi from "joi";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const validateUser = (data: any, update?: boolean) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: update
      ? Joi.string().allow("").optional()
      : Joi.string().required(),
    imgUrl: Joi.string().uri().optional(),
    phoneNumber: Joi.string().optional(),
  });
  return schema.validate(data);
};

const googleSignin = async (req: Request, res: Response) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    if (email) {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          firstName: payload?.given_name || "First",
          lastName: payload?.family_name || "Last",
          email,
          password: "0",
          imgUrl: payload?.picture,
        });
      }
      const tokens = await generateTokens(user);
      res.status(200).send({
        email: user.email,
        _id: user._id,
        imgUrl: user.imgUrl,
        ...tokens,
      });
    } else {
      res.status(400).send("Invalid Google ID token.");
    }
  } catch (err: any) {
    console.error(err);
    res.status(400).send("Error during Google Sign-In.");
  }
};

const register = async (req: Request, res: Response) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: error.details });
  }

  const { email, password, firstName, lastName, imgUrl } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(406).send("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      firstName,
      lastName,
      password: encryptedPassword,
      imgUrl,
    });

    const tokens = await generateTokens(newUser);
    res.status(201).send({
      email: newUser.email,
      _id: newUser._id,
      imgUrl: newUser.imgUrl,
      ...tokens,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(400).send("Error during registration.");
  }
};

const generateTokens = async (user: Document & IUser) => {
  const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET!
  );
  user.refreshTokens = user.refreshTokens
    ? [...user.refreshTokens, refreshToken]
    : [refreshToken];
  await user.save();
  return {
    accessToken,
    refreshToken,
  };
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Missing email or password");
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).send("Email or password incorrect");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send("Email or password incorrect");
    }

    const tokens = await generateTokens(user);
    const { _id, firstName, lastName, email: userEmail, imgUrl } = user;
    return res.status(200).send({
      ...tokens,
      user: { _id, firstName, lastName, email: userEmail, imgUrl },
    });
  } catch (err) {
    console.error(err);
    res.status(400).send("Error processing request");
  }
};

const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1];
  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as jwt.JwtPayload;
    const userDb = await User.findById(decoded._id);
    if (userDb && userDb.refreshTokens?.includes(refreshToken)) {
      userDb.refreshTokens = userDb.refreshTokens.filter(
        (t) => t !== refreshToken
      );
      await userDb.save();
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password -refreshTokens"); // Exclude sensitive fields
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const refresh = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1];
  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as jwt.JwtPayload;
    const userDb = await User.findById(decoded._id);
    if (!userDb || !userDb.refreshTokens?.includes(refreshToken)) {
      res.sendStatus(401);
    } else {
      const newAccessToken = jwt.sign(
        { _id: decoded._id },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
      const newRefreshToken = jwt.sign(
        { _id: decoded._id },
        process.env.JWT_REFRESH_SECRET!
      );
      userDb.refreshTokens = userDb.refreshTokens
        .filter((t) => t !== refreshToken)
        .concat(newRefreshToken);
      await userDb.save();
      res.status(200).send({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { error } = validateUser(req.body, true);
  if (error) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: error.details });
  }

  const { email, firstName, lastName, imgUrl, phoneNumber } = req.body;
  const userId = req.params.id;

  try {
    // Find user by ID and update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        imgUrl,
        phoneNumber,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).send({
      email: updatedUser.email,
      _id: updatedUser._id,
      imgUrl: updatedUser.imgUrl,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(400).send("Error during update.");
  }
};

export default {
  googleSignin,
  register,
  login,
  logout,
  refresh,
  getAllUsers,
  updateUser,
};
