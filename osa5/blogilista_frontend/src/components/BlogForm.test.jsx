import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlogForm from "./BlogForm";

describe("<BlogForm />", () => {
  test("form calls event handler with correct data when a new blog is created", async () => {
    const createBlog = vi.fn();
    const user = userEvent.setup();

    render(<BlogForm createBlog={createBlog} />);

    const titleInput =
      screen.getByPlaceholderText("title") ||
      screen.getByRole("textbox", { name: /title/i });

    const authorInput =
      screen.getByPlaceholderText("author") ||
      screen.getByRole("textbox", { name: /author/i });

    const urlInput =
      screen.getByPlaceholderText("url") ||
      screen.getByRole("textbox", { name: /url/i });

    const submitButton = screen.getByText("create");

    await user.type(titleInput, "Test Blog Title");
    await user.type(authorInput, "Test Author");
    await user.type(urlInput, "http://testblog.com");
    await user.click(submitButton);

    expect(createBlog).toHaveBeenCalledTimes(1);
    expect(createBlog).toHaveBeenCalledWith({
      title: "Test Blog Title",
      author: "Test Author",
      url: "http://testblog.com",
    });
  });
});
