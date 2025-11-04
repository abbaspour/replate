// URL mapping, from path to a function that responds to that URL action
const router = {
  "/": () => showContent("content-home"),
  "/profile": () => requireAuth(() => showContent("content-profile"), "/profile"),
  "/donate": () =>
    requireAuth(() => {
      showContent("content-donate");
      initDonateForm();
    }, "/donate"),
  "/suggest": () =>
    requireAuth(() => {
      showContent("content-suggest");
      initSuggestForm();
    }, "/suggest"),
  "/history": () =>
    requireAuth(() => {
      showContent("content-history");
      loadDonations();
    }, "/history"),
  "/calendar": () =>
    requireAuth(() => {
      showContent("content-calendar");
      loadCalendarToken();
    }, "/calendar"),
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

    // Construct payload for Donor API
    const fd = new FormData(form);
    const amount = parseFloat(fd.get("amount"));
    const testimonial = (fd.get("notes") || "").toString().trim();

    try {
      const resp = await apiFetch("/api/donations/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({ amount, currency: "USD", testimonial: testimonial || undefined })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || `Request failed (${resp.status})`);
      }
      const data = await resp.json();
      console.log("[Donate] Created payment intent:", data);
      form.classList.add("hidden");
      if (thankyou) thankyou.classList.remove("hidden");
    } catch (err) {
      console.error("[Donate] Error:", err);
      alert("There was a problem creating your donation. Please try again.");
      return;
    }

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

// Initialize suggestion form interactions and submission handler
const initSuggestForm = () => {
  const form = document.getElementById("suggest-form");
  const thankyou = document.getElementById("suggest-thankyou");
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

  ["suggestName", "suggestType", "suggestAddress"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => setValidity(el));
      el.addEventListener("change", () => setValidity(el));
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate required fields
    let valid = true;
    ["suggestName", "suggestType", "suggestAddress"].forEach((id) => {
      const el = document.getElementById(id);
      setValidity(el);
      if (el && !el.checkValidity()) valid = false;
    });

    if (!valid) {
      form.classList.add("was-validated");
      return;
    }

    const fd = new FormData(form);
    const payload = {
      name: fd.get("name")?.toString() || "",
      type: fd.get("type")?.toString() || "",
      address: fd.get("address")?.toString() || ""
    };

    try {
      const resp = await apiFetch("/api/suggestions", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || `Request failed (${resp.status})`);
      }
      const data = await resp.json();
      console.log("[Suggest] Created:", data);
      form.classList.add("hidden");
      if (thankyou) thankyou.classList.remove("hidden");
    } catch (err) {
      console.error("[Suggest] Error:", err);
      alert("There was a problem submitting your suggestion. Please try again.");
      return;
    }

    // Redirect home after 3 seconds
    setTimeout(() => {
      const url = "/";
      window.history.pushState({ url }, {}, url);
      showContentFromUrl(url);

      // Reset form for next time
      form.reset();
      form.classList.remove("was-validated");
      ["suggestName", "suggestType", "suggestWebsite", "suggestPhone", "suggestContact", "suggestAddress"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove("is-invalid", "is-valid");
      });
      form.classList.remove("hidden");
      if (thankyou) thankyou.classList.add("hidden");
    }, 3000);
  });
};

// Load donations and render history list
const loadDonations = async () => {
  const loading = document.getElementById("history-loading");
  const list = document.getElementById("history-list");
  const empty = document.getElementById("history-empty");
  const error = document.getElementById("history-error");
  if (!loading || !list || !empty || !error) return;

  loading.classList.remove("hidden");
  list.classList.add("hidden");
  empty.classList.add("hidden");
  error.classList.add("hidden");
  error.textContent = "";

  try {
    const resp = await apiFetch("/api/donations", { method: "GET" });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.message || `Request failed (${resp.status})`);
    }
    const items = await resp.json();
    list.innerHTML = "";
    if (!Array.isArray(items) || items.length === 0) {
      empty.classList.remove("hidden");
    } else {
      for (const d of items) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        const date = d.created_at ? new Date(d.created_at).toLocaleString() : "";
        const amount = typeof d.amount === "number" ? d.amount.toFixed(2) : d.amount;
        li.innerHTML = `<span>${date}</span><span><strong>$${amount}</strong> <span class="badge badge-secondary ml-2">${(d.status || "").toString()}</span></span>`;
        list.appendChild(li);
      }
      list.classList.remove("hidden");
    }
  } catch (e) {
    console.error("[History] Error:", e);
    error.textContent = e.message || "Failed to load donations.";
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
};

// Load calendar federated token, then call Microsoft Graph and render today's events
const loadCalendarToken = async () => {
  const loading = document.getElementById("calendar-loading");
  const error = document.getElementById("calendar-error");
  const refresh = document.getElementById("calendar-refresh");
  const table = document.getElementById("calendar-table");
  const tbody = document.getElementById("calendar-tbody");
  const empty = document.getElementById("calendar-empty");
  const debugPre = document.getElementById("calendar-json");
  if (!loading || !error || !table || !tbody || !empty) return;

  // Reset UI
  loading.classList.remove("hidden");
  error.classList.add("hidden");
  error.textContent = "";
  empty.classList.add("hidden");
  table.classList.add("hidden");
  tbody.innerHTML = "";
  if (debugPre) debugPre.classList.add("hidden");
  if (refresh) refresh.disabled = true;

  try {
    // 1) Get federated access token from our API
    const resp = await apiFetch("/api/calendar/token", { method: "GET" });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(errText || `Request failed (${resp.status})`);
    }
    const tokenPayload = await resp.json();

    // Try common shapes: { access_token }, { token }, { data: { access_token } }
    const msToken = tokenPayload?.access_token || tokenPayload?.token || tokenPayload?.data?.access_token || tokenPayload?.data?.token;
    if (!msToken || typeof msToken !== "string") {
      // Expose raw payload for debugging
      if (debugPre) {
        debugPre.textContent = JSON.stringify(tokenPayload, null, 2);
        debugPre.classList.remove("hidden");
      }
      throw new Error("Calendar token missing from response.");
    }

    // 2) Build today's start/end in local time, send as ISO strings (UTC) for Graph
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    const url = new URL("https://graph.microsoft.com/v1.0/me/calendarView");
    url.searchParams.set("startDateTime", startIso);
    url.searchParams.set("endDateTime", endIso);
    url.searchParams.set("$orderby", "start/dateTime");

    // 3) Call Microsoft Graph
    const graphResp = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${msToken}`,
        "Accept": "application/json"
      }
    });

    if (!graphResp.ok) {
      const errText = await graphResp.text().catch(() => "");
      throw new Error(errText || `Graph request failed (${graphResp.status})`);
    }
    const graphData = await graphResp.json();
    const events = Array.isArray(graphData?.value) ? graphData.value : [];

    // 4) Render table or empty state
    if (events.length === 0) {
      empty.classList.remove("hidden");
    } else {
      for (const ev of events) {
        const tr = document.createElement("tr");
        const startStr = safeGraphDate(ev?.start);
        const endStr = safeGraphDate(ev?.end);
        const subject = (ev?.subject || "").toString();
        const location = (ev?.location?.displayName || "").toString();
        tr.innerHTML = `
          <td>${escapeHtml(startStr)}</td>
          <td>${escapeHtml(endStr)}</td>
          <td>${escapeHtml(subject)}</td>
          <td>${escapeHtml(location)}</td>
        `;
        tbody.appendChild(tr);
      }
      table.classList.remove("hidden");
    }
  } catch (e) {
    console.error("[Calendar] Error:", e);
    error.textContent = e?.message || "Failed to load calendar.";
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
    if (refresh) refresh.disabled = false;
  }
};

// Helpers
const safeGraphDate = (dt) => {
  try {
    if (!dt) return "";
    const iso = dt.dateTime || dt; // Graph may return { dateTime, timeZone } or plain string
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  } catch (_) {
    return "";
  }
};

const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Bind refresh button after DOM ready
(function bindCalendarRefresh(){
  document.addEventListener("click", (ev) => {
    const t = ev.target;
    if (t && t.id === "calendar-refresh") {
      ev.preventDefault();
      requireAuth(() => loadCalendarToken(), "/calendar");
    }
  });
})();

window.onpopstate = (e) => {
  if (e.state && e.state.url && router[e.state.url]) {
    showContentFromUrl(e.state.url);
  }
};
