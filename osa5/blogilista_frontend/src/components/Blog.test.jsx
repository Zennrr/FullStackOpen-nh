import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Blog from "./Blog";
import blogService from "../services/blogs";

vi.mock("../services/blogs", () => {
  return {
    default: {
      update: vi.fn().mockResolvedValue({ likes: 6 }),
    },
  };
});

describe("<Blog />", () => {
  const blog = {
    id: "5a43fde2cbd20b12a2c34e91",
    title: "Component testing is fun",
    author: "Test Author",
    url: "https://testing-library.com/",
    likes: 5,
    user: {
      username: "testuser",
      name: "Test User",
      id: "5a43e6b6c37f3d065eaaa581",
    },
  };

  const mockUpdateBlog = vi.fn();
  const mockDeleteBlog = vi.fn();
  const mockUser = {
    username: "testuser",
    name: "Test User",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders title and author but not URL or likes by default", () => {
    const { container } = render(
      <Blog
        blog={blog}
        updateBlog={mockUpdateBlog}
        deleteBlog={mockDeleteBlog}
        currentUser={mockUser}
      />
    );

    expect(screen.getByText(`${blog.title} ${blog.author}`)).toBeDefined();

    const detailsDiv = container.querySelector(".blog-details");
    expect(detailsDiv).toBeNull();

    expect(screen.queryByText(blog.url)).toBeNull();
    expect(screen.queryByText(`likes ${blog.likes}`)).toBeNull();
  });

  test("shows URL, likes and user when view button is clicked", async () => {
    render(
      <Blog
        blog={blog}
        updateBlog={mockUpdateBlog}
        deleteBlog={mockDeleteBlog}
        currentUser={mockUser}
      />
    );

    const user = userEvent.setup();
    const button = screen.getByText("view");
    await user.click(button);

    expect(screen.getByText(blog.url)).toBeDefined();
    expect(screen.getByText(`likes ${blog.likes}`)).toBeDefined();
    expect(screen.getByText(blog.user.username)).toBeDefined();
  });

  test("like button calls event handler twice when clicked twice", async () => {
    render(
      <Blog
        blog={blog}
        updateBlog={mockUpdateBlog}
        deleteBlog={mockDeleteBlog}
        currentUser={mockUser}
      />
    );

    const user = userEvent.setup();

    const viewButton = screen.getByText("view");
    await user.click(viewButton);

    const likeButton = screen.getByText("like");
    await user.click(likeButton);
    await user.click(likeButton);

    expect(mockUpdateBlog).toHaveBeenCalledTimes(2);

    expect(blogService.update).toHaveBeenCalledTimes(2);
    expect(blogService.update).toHaveBeenCalledWith(
      blog.id,
      expect.objectContaining({
        likes: 6,
      })
    );
  });
});
