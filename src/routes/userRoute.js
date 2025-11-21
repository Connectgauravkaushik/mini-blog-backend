const express = require("express");
const User = require("../models/userModel");
const validator = require("validator");
const userRouter = express.Router();

//Register new user
userRouter.post("/api/auth/signup", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide fullName, email and password",
            });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email" });
        }
        if (
            !validator.isStrongPassword(password, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must include uppercase, lowercase, number and symbol",
            });
        }
        const existing = await User.findOne({ email });

        if (existing) {
            return res
                .status(409)
                .json({ success: false, message: "Email already registered" });
        }

        const newUser = await User.create({ fullName, email, password });

        const token = newUser.getJWT();

        // dev only — NOT for production
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,        // IMPORTANT for Render
            sameSite: "none",    // REQUIRED for cross-origin cookies
            maxAge: 8 * 3600000
        });

        const { password: _, ...userCreated } = newUser.toObject();

        return res
            .status(201)
            .json({ success: true, message: "User registered ✅", NewUser: userCreated });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error", error: error.message });
    }
});

//Authenticate and return session/JWT
userRouter.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Please provide email and password" });
        }

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword)
            return res.status(400).json({ message: "Invalid password" });

        const token = user.getJWT();

        // dev only — NOT for production
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 8 * 3600000
        });

        const { password: _, "__v": __, ...loggedInUser } = user.toObject();
        return res
            .status(200)
            .json({ success: true, message: "Login successfully ✅", NewUser: loggedInUser });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).send("not working ");
    }
});

// logout
userRouter.post("/api/auth/logout", async (req, res) => {
    try {
        res.cookie("token", null, { expires: new Date(0) });
        return res.status(200).json({ success: true, message: "Logged out" });
    } catch (error) {
        console.error("Logout error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = userRouter;
