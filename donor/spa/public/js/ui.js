// URL mapping, from hash to a function that responds to that URL action
const router = {
  "/": () => showContent("content-home"),
  "/profile": () =>
    requireAuth(() => showContent("content-profile"), "/profile"),
  "/donate": () =>
    requireAuth(() => {
      showContent("content-donate");
      initDonateForm();
    }, "/donate"),
  "/login": () => login()
};

//Declare helper functions

/**
 * Iterates over the elements matching 'selector' and passes them
 * to 'fn'
 * @param {*} selector The CSS selector to find
 * @param {*} fn The function to execute for every element
 */
const eachElement = (selector, fn) => {
  for (let e of document.querySelectorAll(selector)) {
    fn(e);
  }
};

/**
 * Tries to display a content panel that is referenced
 * by the specified route URL. These are matched using the
 * router, defined above.
 * @param {*} url The route URL
 */
const showContentFromUrl = (url) => {
  if (router[url]) {
    router[url]();
    return true;
  }

  return false;
};

/**
 * Returns true if `element` is a hyperlink that can be considered a link to another SPA route
 * @param {*} element The element to check
 */
const isRouteLink = (element) =>
  element.tagName === "A" && element.classList.contains("route-link");

/**
 * Displays a content panel specified by the given element id.
 * All the panels that participate in this flow should have the 'page' class applied,
 * so that it can be correctly hidden before the requested content is shown.
 * @param {*} id The id of the content to show
 */
const showContent = (id) => {
  eachElement(".page", (p) => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
};

/**
 * Updates the user interface
 */
const updateUI = async () => {
  try {
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
      const user = await auth0Client.getUser();

      document.getElementById("profile-data").innerText = JSON.stringify(
        user,
        null,
        2
      );

      document.querySelectorAll("pre code").forEach(hljs.highlightBlock);

      eachElement(".profile-image", (e) => (e.src = user.picture));
      eachElement(".user-name", (e) => (e.innerText = user.name));
      eachElement(".user-email", (e) => (e.innerText = user.email));
      eachElement(".auth-invisible", (e) => e.classList.add("hidden"));
      eachElement(".auth-visible", (e) => e.classList.remove("hidden"));
    } else {
      eachElement(".auth-invisible", (e) => e.classList.remove("hidden"));
      eachElement(".auth-visible", (e) => e.classList.add("hidden"));
    }
  } catch (err) {
    console.log("Error updating UI!", err);
    return;
  }

  console.log("UI updated");
};

// Initialize donation form interactions and submission handler
const initDonateForm = () => {
  const form = document.getElementById("donation-form");
  const thankyou = document.getElementById("donation-thankyou");
  if (!form || form.dataset.bound === "true") return;
  form.dataset.bound = "true";

  const setValidity = (el) => {
    if (!el) return;
    if (!el.checkValidity()) {
      el.classList.add("is-invalid");
      el.classList.remove("is-valid");
    } else {
      el.classList.remove("is-invalid");
      el.classList.add("is-valid");
    }
  };

  ["donorName", "donorAddress", "cardNumber", "cvv", "amount"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => setValidity(el));
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Basic HTML5 validity check
    let valid = true;
    ["donorName", "donorAddress", "cardNumber", "cvv", "amount"].forEach((id) => {
      const el = document.getElementById(id);
      setValidity(el);
      if (el && !el.checkValidity()) valid = false;
    });

    if (!valid) {
      form.classList.add("was-validated");
      return;
    }

    // For demo, we do not send data to a backend. Log the payload and show thank-you.
    const data = Object.fromEntries(new FormData(form).entries());
    console.log("[Donate] Submission:", data);

    form.classList.add("hidden");
    if (thankyou) thankyou.classList.remove("hidden");

    // Redirect home after 3 seconds
    setTimeout(() => {
      const url = "/";
      window.history.pushState({ url }, {}, url);
      showContentFromUrl(url);
      // Reset the form for next time
      form.reset();
      form.classList.remove("was-validated");
      ["donorName", "donorAddress", "cardNumber", "cvv", "amount"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.remove("is-invalid", "is-valid");
        }
      });
      form.classList.remove("hidden");
      if (thankyou) thankyou.classList.add("hidden");
    }, 3000);
  });
};

window.onpopstate = (e) => {
  if (e.state && e.state.url && router[e.state.url]) {
    showContentFromUrl(e.state.url);
  }
};
