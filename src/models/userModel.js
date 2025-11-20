const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
        minlength: [2, "Full name must have at least 2 characters"],
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (v) => validator.isEmail(v),
            message: "Invalid email address",
        },
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
    }
}, { timestamps: true });

// Hash only when password is created/modified
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)

    next();
});


UserSchema.methods.getJWT = function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, "gaurav@123", { expiresIn: '1d' });
    return token;
}

// compare password helper (useful in login)
UserSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;

    const passwordHash = user.password
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordValid
}


const User = mongoose.model("User", UserSchema);

module.exports = User;