const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true, strict: "throw" });

blogSchema.pre("validate", function (next) {
    if (!this.slug && this.title) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true
        });
    }
    next();
})

const Blog = mongoose.model('blog', blogSchema);
module.exports = Blog;