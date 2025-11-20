const express = require("express");
const auth = require("../middlewares/userAuth");
const Blog = require("../models/blogModel");
const blogRouter = express.Router();

// create the blog
blogRouter.post("/api/blogs", auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and content",
      });
    }

    const author = req.user._id;

    const newBlogCreated = await Blog.create({
      title,
      content,
      author,
    });
    return res
      .status(201)
      .json({
        success: true,
        message: "blog created ✅",
        blog: newBlogCreated,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// get all the blogs (public)
blogRouter.get("/api/blogs", async (req, res) => {
  try {
    const allBlogs = await Blog.find({})
      .populate("author", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All blogs fetched",
      blogs: allBlogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// get blogs created by the logged in user
blogRouter.get("/api/blogs/author", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const blogs = await Blog.find({ author: userId })
      .populate("author", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Blogs created by the logged-in user fetched",
      blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// author can edit the blog
blogRouter.put("/api/blogs/edit/:id", auth, async (req, res) => {

  try {
    const { id } = req.params;
    const allowedUpdates = ["title", "content"];

    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key]) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Only title and content can be updated",
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found ❌" });

    if (blog.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this blog ❌" });
    }
    Object.assign(blog, updates);
    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully ✅",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// author can delete the blog
blogRouter.delete("/api/blogs/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;


    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found ❌" });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed to delete this blog ❌" });
    }

    await blog.deleteOne(); 

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully ✅",
      blogId: id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


module.exports = blogRouter;
