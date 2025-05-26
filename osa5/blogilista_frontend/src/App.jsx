import { useState, useEffect, useRef } from "react";
import Blog from "./components/Blog";
import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Notification from "./components/Notification";
import Togglable from "./components/Togglable";
import blogService from "./services/blogs";
import loginService from "./services/login";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState(null);
  const [loginVisible, setLoginVisible] = useState(false);

  const blogFormRef = useRef();

  useEffect(() => {
    blogService.getAll().then((blogs) => {
      const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes);
      setBlogs(sortedBlogs);
    });
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotification(null);
      setNotificationType(null);
    }, 5000);
  };

  const handleLogin = async (username, password) => {
    try {
      const user = await loginService.login({
        username,
        password,
      });

      window.localStorage.setItem("loggedUser", JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      setLoginVisible(false);
      showNotification(`Welcome ${user.username}!`);
    } catch (exception) {
      showNotification("Wrong username or password", "error");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("loggedUser");
    setUser(null);
    blogService.setToken(null);
    showNotification("Logged out successfully");
  };

  const createBlog = async (blogObject) => {
    try {
      //console.log("Creating blog with token for user:", user.username);
      const returnedBlog = await blogService.create(blogObject);
      //console.log("Blog created, attributed to:", returnedBlog.user.username);

      const updatedBlogs = blogs
        .concat(returnedBlog)
        .sort((a, b) => b.likes - a.likes);

      setBlogs(updatedBlogs);
      blogFormRef.current.toggleVisibility();

      showNotification(
        `A new blog ${returnedBlog.title} by ${returnedBlog.author} added`
      );
    } catch (exception) {
      showNotification("Failed to create blog", "error");
      console.error("Error creating blog:", exception);
    }
  };

  const updateBlog = (updatedBlog) => {
    const updatedBlogs = blogs
      .map((blog) => (blog.id === updatedBlog.id ? updatedBlog : blog))
      .sort((a, b) => b.likes - a.likes);

    setBlogs(updatedBlogs);
  };

  const deleteBlog = async (blogId) => {
    try {
      await blogService.remove(blogId);
      setBlogs(blogs.filter((blog) => blog.id !== blogId));
      showNotification("Blog deleted successfully");
    } catch (exception) {
      showNotification("Failed to delete blog", "error");
      console.error("Error deleting blog:", exception);
    }
  };

  return (
    <div>
      <Notification message={notification} type={notificationType} />

      {!user ? (
        <div>
          <h2>blogs</h2>
          {loginVisible ? (
            <div>
              <LoginForm
                handleLogin={handleLogin}
                handleCancel={() => setLoginVisible(false)}
              />
            </div>
          ) : (
            <div>
              <button onClick={() => setLoginVisible(true)}>log in</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>blogs</h2>
          <p>
            {user.username} logged in
            <button onClick={handleLogout}>logout</button>
          </p>
          {blogs.map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              updateBlog={updateBlog}
              deleteBlog={deleteBlog}
              currentUser={user}
            />
          ))}

          <Togglable buttonLabel="create new blog" ref={blogFormRef}>
            <BlogForm createBlog={createBlog} />
          </Togglable>
        </div>
      )}
    </div>
  );
};

export default App;
