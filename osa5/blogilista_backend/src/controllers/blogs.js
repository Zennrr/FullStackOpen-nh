const blogsRouter = require("express").Router();
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const middleware = require("../utils/middleware");

blogsRouter.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate("user", {
      username: 1,
      name: 1,
    });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching blogs." });
  }
});

blogsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const blog = await Blog.findById(id).populate("user", {
      username: 1,
      name: 1,
    });

    if (blog) {
      res.json(blog);
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the blog." });
  }
});

blogsRouter.post(
  "/",
  middleware.tokenExtractor,
  middleware.userExtractor,
  async (req, res) => {
    const body = req.body;

    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes === undefined ? 0 : body.likes,
        user: user._id,
      });

      const savedBlog = await blog.save();

      user.blogs = user.blogs.concat(savedBlog._id);
      await user.save();

      await savedBlog.populate("user", { username: 1, name: 1, id: 1 });

      res.status(201).json(savedBlog);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

blogsRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, url, likes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const blog = {
    title,
    author,
    url,
    likes,
  };

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, blog, {
      new: true,
      runValidators: true,
    }).populate("user", { username: 1, name: 1 });

    if (updatedBlog) {
      res.json(updatedBlog);
    } else {
      res.status(404).json({ error: "Blog not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the blog." });
  }
});

blogsRouter.delete(
  "/:id",
  middleware.tokenExtractor,
  middleware.userExtractor,
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "token missing or invalid" });
    }

    try {
      const user = req.user;
      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
      }

      if (blog.user.toString() !== user._id.toString()) {
        return res
          .status(403)
          .json({ error: "only the creator can delete a blog" });
      }

      await Blog.findByIdAndRemove(id);
      res.status(204).end();
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the blog." });
    }
  }
);

module.exports = blogsRouter;
