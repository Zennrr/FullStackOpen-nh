const Blog = require("../src/models/blog");
const User = require("../src/models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: "poistetaan",
    author: "poistetaan",
    url: "http://esimerkki.fi",
    likes: 0,
  });

  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const getTestUserAndToken = async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("sekret", 10);

  const user = new User({
    username: "root",
    name: "Root User",
    passwordHash,
  });

  const savedUser = await user.save();

  const userForToken = {
    username: savedUser.username,
    id: savedUser._id.toString(),
  };

  return {
    token: jwt.sign(userForToken, process.env.SECRET),
    user: savedUser,
  };
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
  getTestUserAndToken,
};
