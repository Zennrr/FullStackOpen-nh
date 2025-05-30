const testingRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

testingRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Testing API is working" });
});

testingRouter.post("/reset", async (request, response) => {
  try {
    await Blog.deleteMany({});
    await User.deleteMany({});
    response.status(204).end();
  } catch (error) {
    console.error("Error resetting database:", error);
    response.status(500).json({ error: "Database reset failed" });
  }
});

module.exports = testingRouter;
