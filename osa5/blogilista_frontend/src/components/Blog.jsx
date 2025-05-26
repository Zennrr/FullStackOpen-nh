import { useState } from "react";
import blogService from "../services/blogs";
import PropTypes from "prop-types";

const Blog = ({ blog, updateBlog, deleteBlog, currentUser }) => {
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [likes, setLikes] = useState(blog.likes);

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  const toggleDetails = () => {
    setDetailsVisible(!detailsVisible);
  };

  const handleLike = async () => {
    const updatedBlog = {
      user: blog.user.id,
      likes: likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url,
    };

    try {
      const returnedBlog = await blogService.update(blog.id, updatedBlog);
      setLikes(returnedBlog.likes);
      if (updateBlog) {
        updateBlog({
          ...blog,
          likes: returnedBlog.likes,
        });
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      // Still update the UI even if API call fails
      setLikes(likes + 1);
      if (updateBlog) {
        updateBlog({
          ...blog,
          likes: likes + 1,
        });
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      try {
        await deleteBlog(blog.id);
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  const isCreator =
    currentUser && blog.user && currentUser.username === blog.user.username;

  return (
    <div style={blogStyle} className="blog">
      <div className="blog-title">
        {blog.title} {blog.author}
        <button onClick={toggleDetails} className="toggle-button">
          {detailsVisible ? "hide" : "view"}
        </button>
      </div>

      {detailsVisible && (
        <div className="blog-details">
          <div>{blog.url}</div>
          <div className="blog-likes">
            likes {likes}
            <button onClick={handleLike} className="like-button">
              like
            </button>
          </div>
          <div>{blog.user ? blog.user.username : "unknown user"}</div>
          {isCreator && (
            <button onClick={handleDelete} className="delete-button">
              delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    user: PropTypes.shape({
      username: PropTypes.string.isRequired,
      name: PropTypes.string,
      id: PropTypes.string.isRequired,
    }),
  }).isRequired,
  updateBlog: PropTypes.func.isRequired,
  deleteBlog: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired,
    name: PropTypes.string,
    token: PropTypes.string.isRequired,
  }).isRequired,
};

export default Blog;
