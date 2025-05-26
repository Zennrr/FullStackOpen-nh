describe("Blog app", function () {
  beforeEach(function () {
    cy.request("POST", "http://localhost:3003/api/testing/reset");
    const user = {
      name: "Test User",
      username: "testuser",
      password: "password123",
    };
    cy.request("POST", "http://localhost:3003/api/users", user);
    cy.visit("http://localhost:5173");
  });

  //test that login form is shown by default
  it("Login form is shown", function () {
    cy.contains("Log in to application").should("not.exist");
    cy.contains("log in").click();
    cy.contains("Log in to application");
    cy.get('input[name="Username"]').should("be.visible");
    cy.get('input[name="Password"]').should("be.visible");
  });

  //test login functionality
  describe("Login", function () {
    beforeEach(function () {
      cy.contains("log in").click();
    });

    it("succeeds with correct credentials", function () {
      cy.get('input[name="Username"]').type("testuser");
      cy.get('input[name="Password"]').type("password123");
      cy.contains("login").click();
      cy.contains("testuser logged in");
      cy.contains("Welcome testuser!");
    });

    it("fails with wrong credentials", function () {
      cy.get('input[name="Username"]').type("testuser");
      cy.get('input[name="Password"]').type("wrongpassword");
      cy.contains("login").click();
      cy.contains("Wrong username or password");
      cy.contains("Wrong username or password").should(
        "have.css",
        "color",
        "rgb(255, 0, 0)"
      );
      cy.contains("testuser logged in").should("not.exist");
    });
  });

  //tests for logged in functionality
  describe("When logged in", function () {
    beforeEach(function () {
      cy.intercept("POST", "**/api/blogs*").as("createBlog");

      cy.request("POST", "http://localhost:3003/api/login", {
        username: "testuser",
        password: "password123",
      }).then((response) => {
        localStorage.setItem("loggedUser", JSON.stringify(response.body));
        cy.visit("http://localhost:5173");
      });
    });

    //test blog creation
    it("A blog can be created", function () {
      const token = JSON.parse(localStorage.getItem("loggedUser")).token;
      const blog = {
        title: "Test Blog Title",
        author: "Test Author",
        url: "http://testblog.com",
      };

      cy.request({
        url: "http://localhost:3003/api/blogs",
        method: "POST",
        body: blog,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      cy.visit("http://localhost:5173");

      cy.contains("Test Blog Title Test Author").should("be.visible");

      cy.contains("Test Blog Title Test Author")
        .parent()
        .find(".toggle-button")
        .click();
      cy.contains("http://testblog.com").should("be.visible");
    });

    //test liking a blog
    describe("When a blog exists", function () {
      beforeEach(function () {
        const blog = {
          title: "Another Test Blog",
          author: "Another Author",
          url: "http://anothertestblog.com",
        };

        const token = JSON.parse(localStorage.getItem("loggedUser")).token;

        cy.request({
          url: "http://localhost:3003/api/blogs",
          method: "POST",
          body: blog,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        cy.visit("http://localhost:5173");
        cy.contains("Another Test Blog Another Author")
          .should("be.visible")
          .parent()
          .as("theBlog");
      });

      it("A blog can be liked", function () {
        cy.get("@theBlog").find(".toggle-button").click();
        cy.get("@theBlog").find(".blog-likes").contains("likes 0");
        cy.get("@theBlog").find(".like-button").click();

        cy.get("@theBlog").find(".blog-likes").contains("likes 1");
      });

      //test blog deletion by the creator
      it("A blog can be deleted by the creator", function () {
        cy.get("@theBlog").find(".toggle-button").click();
        cy.get("@theBlog").find(".delete-button").click();
        cy.on("window:confirm", () => true);

        cy.contains("Blog deleted successfully");
        cy.contains("Another Test Blog Another Author").should("not.exist");
      });
    });

    //test that only creator sees delete button
    describe("When another user creates a blog", function () {
      beforeEach(function () {
        const anotherUser = {
          name: "Another User",
          username: "anotheruser",
          password: "password123",
        };
        cy.request("POST", "http://localhost:3003/api/users", anotherUser);

        const firstUserBlog = {
          title: "First User Blog",
          author: "First User",
          url: "http://firstuser.com",
        };

        const token = JSON.parse(localStorage.getItem("loggedUser")).token;

        cy.request({
          url: "http://localhost:3003/api/blogs",
          method: "POST",
          body: firstUserBlog,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        cy.visit("http://localhost:5173");
        cy.contains("logout").click();

        cy.contains("log in").click();
        cy.get('input[name="Username"]').type("anotheruser");
        cy.get('input[name="Password"]').type("password123");
        cy.contains("login").click();

        cy.request("POST", "http://localhost:3003/api/login", {
          username: "anotheruser",
          password: "password123",
        }).then((response) => {
          const secondUserToken = response.body.token;

          const secondUserBlog = {
            title: "Second User Blog",
            author: "Second User",
            url: "http://seconduser.com",
          };

          cy.request({
            url: "http://localhost:3003/api/blogs",
            method: "POST",
            body: secondUserBlog,
            headers: {
              Authorization: `Bearer ${secondUserToken}`,
            },
          });

          cy.visit("http://localhost:5173");
        });
      });

      it("Only creator can see the delete button", function () {
        cy.contains("First User Blog First User")
          .should("be.visible")
          .parent()
          .as("firstUserBlog");
        cy.contains("Second User Blog Second User")
          .should("be.visible")
          .parent()
          .as("secondUserBlog");

        cy.get("@firstUserBlog").find(".toggle-button").click();
        cy.get("@firstUserBlog").find(".delete-button").should("not.exist");

        cy.get("@secondUserBlog").find(".toggle-button").click();
        cy.get("@secondUserBlog").find(".delete-button").should("be.visible");
      });
    });

    //test blogs are sorted by likes
    describe("When multiple blogs with different likes exist", function () {
      beforeEach(function () {
        const token = JSON.parse(localStorage.getItem("loggedUser")).token;

        cy.request({
          url: "http://localhost:3003/api/blogs",
          method: "POST",
          body: {
            title: "Blog with least likes",
            author: "Author 1",
            url: "http://blog1.com",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((response) => {
          const blog1Id = response.body.id;

          cy.request({
            url: "http://localhost:3003/api/blogs",
            method: "POST",
            body: {
              title: "Blog with most likes",
              author: "Author 2",
              url: "http://blog2.com",
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((response) => {
            const blog2Id = response.body.id;

            cy.request({
              url: "http://localhost:3003/api/blogs",
              method: "POST",
              body: {
                title: "Blog with second most likes",
                author: "Author 3",
                url: "http://blog3.com",
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).then((response) => {
              const blog3Id = response.body.id;

              cy.request({
                url: `http://localhost:3003/api/blogs/${blog2Id}`,
                method: "PUT",
                body: {
                  likes: 3,
                },
              });

              cy.request({
                url: `http://localhost:3003/api/blogs/${blog3Id}`,
                method: "PUT",
                body: {
                  likes: 2,
                },
              });

              cy.visit("http://localhost:5173");
            });
          });
        });
      });

      it("Blogs are ordered according to likes with the most likes being first", function () {
        cy.get(".blog").eq(0).should("contain", "Blog with most likes");
        cy.get(".blog").eq(1).should("contain", "Blog with second most likes");
        cy.get(".blog").eq(2).should("contain", "Blog with least likes");
      });
    });
  });
});
