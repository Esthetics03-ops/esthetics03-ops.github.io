(() => {
  "use strict";
  const send = (name, params = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params);
    }
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (href.startsWith("mailto:")) send("contact_email_click", { link_url: href });
    else if (href.startsWith("tel:")) send("contact_phone_click", { link_url: href });
    else if (href.startsWith("http")) send("outbound_click", { link_url: href });
  });

  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", () => send("newsletter_signup_attempt", {
      form_id: form.getAttribute("id") || "newsletter"
    }));
  }
})();