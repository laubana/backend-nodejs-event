const stripe = require("stripe")(process.env.STRIPE_SECRET);
const axios = require("axios");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const User = require("../model/User");

const signUp = async (req, res) => {
  try {
    const {
      email,
      password,
      imageUrl,
      name,
      address,
      latitude,
      longitude,
      description,
    } = req.body;

    if (!email || !password || !imageUrl || !name) {
      return res
        .status(400)
        .json({ message: "Invalid input. Please try again." });
    }

    const user = await User.findOne({ email }).lean().exec();

    if (user) {
      return res.status(409).json({
        message: "The email already exists. Please try another.",
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const customer = await stripe.customers.create({
      name,
      email,
    });

    const newUser = await User.create({
      email,
      password: hashedPassword,
      imageUrl,
      name,
      address,
      latitude,
      longitude,
      description,
      customerId: customer.id,
    });

    res.status(201).json({ message: "Account created.", data: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server failed." });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Invalid input. Please try again." });
    }

    const user = await User.findOne({ email }).lean().exec();

    if (!user) {
      return res.status(401).json({ message: "Sign in failed." });
    }

    const isMatch = bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Sign in failed." });
    }

    const accessToken = jsonwebtoken.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jsonwebtoken.sign(
      { id: user._id.toString(), email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Sign in succeeded.",
      data: {
        accessToken,
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server failed." });
  }
};

const refresh = (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.refreshToken) {
      return res.status(401).json({ message: "Sign in failed." });
    }

    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Sign in failed." });
    }

    jsonwebtoken.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (error, result) => {
        if (error) {
          return res.status(401).json({ message: "Sign in failed." });
        }

        const user = await User.findOne({
          email: result.email,
        })
          .lean()
          .exec();

        if (!user) {
          return res.status(401).json({ message: "Sign in failed." });
        }

        const accessToken = jsonwebtoken.sign(
          {
            id: user._id.toString(),
            email: user.email,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        res.status(200).json({
          message: "Sign in succeeded.",
          data: {
            accessToken,
            id: user._id.toString(),
            email: user.email,
          },
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server failed." });
  }
};

const oauth = async (req, res) => {
  try {
    const { code } = req.query;

    const response = await axios.post(
      [
        `https://oauth2.googleapis.com/token?client_id=${process.env.GOOGLE_CLIENT_ID}`,
        `redirect_uri=${process.env.BACKEND_URL}/auth/oauth`,
        `client_secret=${process.env.GOOGLE_SECRET}`,
        `code=${code}`,
        `scope=`,
        `grant_type=authorization_code`,
      ].join("&")
    );

    const accessToken = response.data.access_token;

    const {
      email,
      picture: imageUrl,
      name,
    } = (
      await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    ).data;

    const user = await User.findOne({ email }).lean().exec();

    let userId;

    if (user) {
      userId = user.id;
    } else {
      const customer = await stripe.customers.create({
        name,
        email,
      });

      const newUser = await User.create({
        email,
        imageUrl,
        name,
        customerId: customer.id,
      });

      userId = newUser._id;
    }

    const refreshToken = jsonwebtoken.sign(
      { id: userId, email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    console.log(error);
  } finally {
    res.redirect(`${process.env.FRONTEND_URL}`);
  }
};

module.exports = {
  signUp,
  signIn,
  refresh,
  oauth,
};
