const toggleButton = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

toggleButton?.addEventListener("click", () => {
  navLinks?.classList.toggle("open");
  if (toggleButton && navLinks) {
    const isOpen = navLinks.classList.contains("open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  }
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks?.classList.remove("open");
    if (toggleButton) {
      toggleButton.setAttribute("aria-expanded", "false");
    }
  });
});

if (toggleButton) {
  toggleButton.setAttribute("aria-expanded", "false");
}

const STORAGE_VENDOR_SESSION_KEY = "nova_vendor_session_v1";
const STORAGE_VENDOR_PROFILES_KEY = "nova_vendor_profiles_v1";

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getVendorSession = () =>
  safeJsonParse(localStorage.getItem(STORAGE_VENDOR_SESSION_KEY));

const setVendorSession = (session) => {
  localStorage.setItem(STORAGE_VENDOR_SESSION_KEY, JSON.stringify(session));
};

const clearVendorSession = () => {
  localStorage.removeItem(STORAGE_VENDOR_SESSION_KEY);
};

const getVendorProfiles = () => {
  const parsed = safeJsonParse(localStorage.getItem(STORAGE_VENDOR_PROFILES_KEY));
  return parsed && typeof parsed === "object" ? parsed : {};
};

const setVendorProfiles = (profiles) => {
  localStorage.setItem(STORAGE_VENDOR_PROFILES_KEY, JSON.stringify(profiles));
};

const upsertVendorProfile = (email, patch) => {
  if (!email) return;
  const profiles = getVendorProfiles();
  profiles[email] = { ...(profiles[email] || {}), ...patch, updatedAt: Date.now() };
  setVendorProfiles(profiles);
};

const getCurrentVendorProfile = () => {
  const session = getVendorSession();
  if (!session?.email) return null;
  const profiles = getVendorProfiles();
  return profiles[session.email] || null;
};

const isProvidersSubdir = window.location.pathname.includes(
  "/proveedores-boda-valencia/"
);

const navLogin = document.querySelector(".nav-login");
if (navLogin) {
  const session = getVendorSession();
  if (session?.email) {
    navLogin.textContent = "Mi cuenta";
    navLogin.setAttribute(
      "href",
      isProvidersSubdir ? "../vendor-dashboard.html" : "vendor-dashboard.html"
    );
  } else {
    navLogin.textContent = "Iniciar sesión";
    navLogin.setAttribute(
      "href",
      isProvidersSubdir ? "../vendors-auth.html" : "vendors-auth.html"
    );
  }
}

const vendorProfileHref = window.location.pathname.includes(
  "/proveedores-boda-valencia/"
)
  ? "../vendor-profile.html"
  : "vendor-profile.html";

document.querySelectorAll(".vendor-card-page .btn.ghost").forEach((button) => {
  button.textContent = "Solicitar info";
  button.setAttribute("href", vendorProfileHref);
});

document.querySelectorAll(".vendor-card-page").forEach((card) => {
  if (card.querySelector(".vendor-card-body")) return;
  const image = card.querySelector("img.vendor-image");
  const nodes = Array.from(card.children).filter((child) => child !== image);
  const body = document.createElement("div");
  body.className = "vendor-card-body";
  nodes.forEach((node) => body.appendChild(node));
  if (image) {
    card.appendChild(body);
  } else {
    card.prepend(body);
  }
});

const categorySearch = document.querySelector("#category-search");
if (categorySearch) {
  const categoryTargets = document.querySelectorAll(
    ".category-grid-list .category-card-link, .category-pill-grid .pill"
  );
  const normalize = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const applyFilter = () => {
    const term = normalize(categorySearch.value.trim());
    categoryTargets.forEach((target) => {
      const label = normalize(target.textContent.trim());
      const match = term.length === 0 || label.includes(term);
      target.hidden = !match;
    });
  };

  categorySearch.addEventListener("input", applyFilter);
  applyFilter();
}

const authTabs = document.querySelectorAll("[data-auth-tab]");
const authPanels = document.querySelectorAll("[data-auth-panel]");

const activateAuthTab = (target) => {
  authTabs.forEach((tab) => {
    const isActive = tab.getAttribute("data-auth-tab") === target;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  authPanels.forEach((panel) => {
    const isActive = panel.getAttribute("data-auth-panel") === target;
    panel.classList.toggle("is-active", isActive);
  });
};

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-auth-tab");
    if (target) activateAuthTab(target);
  });
});

document.querySelectorAll("[data-auth-switch]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-auth-switch");
    if (target) activateAuthTab(target);
  });
});

const loginForm = document.querySelector("#vendorLoginForm");
if (loginForm) {
  const existingSession = getVendorSession();
  if (existingSession?.email && !window.location.search.includes("force=1")) {
    window.location.href = "vendor-dashboard.html";
  }

  const emailInput = loginForm.querySelector('input[name="login-email"]');
  const errorEl = loginForm.querySelector("[data-auth-error]");
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }

    const email = emailInput?.value?.trim() || "";
    if (!email) {
      if (errorEl) {
        errorEl.textContent = "Introduce tu email para continuar.";
        errorEl.hidden = false;
      }
      emailInput?.focus();
      return;
    }

    setVendorSession({ email, loggedInAt: Date.now() });
    if (!getVendorProfiles()[email]) {
      upsertVendorProfile(email, {
        name: email.split("@")[0] || "Proveedor",
        category: "",
        location: "Valencia y alrededores",
        description: "",
        contactEmail: email,
        phone: "",
        rating: "—",
        responseTime: "24-48h",
        availability:
          "Fechas más solicitadas: mayo, junio, septiembre y octubre. Recomendamos reservar con 9-12 meses de antelación.",
        packages: [
          {
            name: "Pack Esencial",
            price: "950",
            currency: "EUR",
            items: [
              "Cobertura de ceremonia y retratos",
              "Entrega digital editada",
              "Reunión previa",
            ],
          },
          {
            name: "Pack Completo",
            price: "1450",
            currency: "EUR",
            items: [
              "Cobertura completa del día",
              "Sesión pre o post boda",
              "Galería privada para invitados",
            ],
          },
        ],
        faqs: [
          {
            question: "¿Incluye desplazamiento?",
            answer:
              "Sí dentro de Valencia ciudad. Para alrededores se confirma según ubicación.",
          },
          {
            question: "¿Cuándo se entrega el reportaje?",
            answer: "Normalmente entre 4 y 8 semanas según temporada.",
          },
        ],
      });
    }

    window.location.href = "vendor-dashboard.html";
  });
}

const signupForm = document.querySelector("#vendorSignupForm");
if (signupForm) {
  const nameInput = signupForm.querySelector('input[name="signup-name"]');
  const emailInput = signupForm.querySelector('input[name="signup-email"]');
  const phoneInput = signupForm.querySelector('input[name="signup-phone"]');
  const passwordInput = signupForm.querySelector(
    'input[name="signup-password"]'
  );
  const confirmPasswordInput = signupForm.querySelector(
    'input[name="signup-confirm-password"]'
  );
  const errorEl = signupForm.querySelector("[data-auth-error]");

  if (passwordInput && confirmPasswordInput) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = "";
      }

      if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.setCustomValidity("Las contraseñas no coinciden.");
        confirmPasswordInput.reportValidity();
        return;
      }
      confirmPasswordInput.setCustomValidity("");

      const email = emailInput?.value?.trim() || "";
      const name = nameInput?.value?.trim() || "";
      const phone = phoneInput?.value?.trim() || "";
      if (!email || !name) {
        if (errorEl) {
          errorEl.textContent = "Completa el nombre comercial y el email.";
          errorEl.hidden = false;
        }
        return;
      }

      upsertVendorProfile(email, {
        name,
        category: "",
        location: "Valencia y alrededores",
        description: "",
        contactEmail: email,
        phone,
        rating: "—",
        responseTime: "24-48h",
        availability:
          "Fechas más solicitadas: mayo, junio, septiembre y octubre. Recomendamos reservar con 9-12 meses de antelación.",
        packages: [
          {
            name: "Pack Esencial",
            price: "950",
            currency: "EUR",
            items: [
              "Cobertura de ceremonia y retratos",
              "Entrega digital editada",
              "Reunión previa",
            ],
          },
          {
            name: "Pack Completo",
            price: "1450",
            currency: "EUR",
            items: [
              "Cobertura completa del día",
              "Sesión pre o post boda",
              "Galería privada para invitados",
            ],
          },
        ],
        faqs: [
          {
            question: "¿Incluye desplazamiento?",
            answer:
              "Sí dentro de Valencia ciudad. Para alrededores se confirma según ubicación.",
          },
          {
            question: "¿Cuándo se entrega el reportaje?",
            answer: "Normalmente entre 4 y 8 semanas según temporada.",
          },
        ],
      });
      setVendorSession({ email, loggedInAt: Date.now() });
      window.location.href = "vendor-dashboard.html";
    });

    confirmPasswordInput.addEventListener("input", () => {
      if (confirmPasswordInput.validity.customError) {
        confirmPasswordInput.setCustomValidity("");
      }
    });
  }
}

const dashboardForm = document.querySelector("#vendorProfileForm");
if (dashboardForm) {
  const session = getVendorSession();
  if (!session?.email) {
    window.location.href = "vendors-auth.html";
  } else {
    const emailEl = document.querySelector("#vendorSessionEmail");
    if (emailEl) emailEl.textContent = session.email;

    const logoutBtn = document.querySelector("#vendorLogoutBtn");
    logoutBtn?.addEventListener("click", () => {
      clearVendorSession();
      window.location.href = "vendors-auth.html";
    });

    const statusEl = document.querySelector("#vendorSaveStatus");

    const profile = getCurrentVendorProfile() || {};
    const setField = (name, value) => {
      const el = dashboardForm.querySelector(`[name="${name}"]`);
      if (!el) return;
      const nextValue = value || "";
      // If the saved value isn't in a <select>, preserve it by adding an option.
      if (el.tagName === "SELECT" && nextValue) {
        const hasOption = Array.from(el.options).some(
          (opt) => opt.value === nextValue
        );
        if (!hasOption) {
          const opt = document.createElement("option");
          opt.value = nextValue;
          opt.textContent = `${nextValue} (Personalizado)`;
          el.appendChild(opt);
        }
      }
      el.value = nextValue;
    };

    setField("name", profile.name);
    setField("category", profile.category);
    setField("location", profile.location);
    setField("description", profile.description);
    setField("contactEmail", profile.contactEmail || session.email);
    setField("phone", profile.phone);
    setField("responseTime", profile.responseTime);
    setField("availability", profile.availability);

    const packages = Array.isArray(profile.packages) ? profile.packages : [];
    const toLines = (items) =>
      Array.isArray(items) ? items.filter(Boolean).join("\n") : "";

    const pkg1 = packages[0] || {};
    setField("pkg1Name", pkg1.name);
    setField("pkg1Price", pkg1.price);
    setField("pkg1Items", toLines(pkg1.items));

    const pkg2 = packages[1] || {};
    setField("pkg2Name", pkg2.name);
    setField("pkg2Price", pkg2.price);
    setField("pkg2Items", toLines(pkg2.items));

    const publicLink = document.querySelector("#vendorPublicProfileLink");
    if (publicLink) publicLink.setAttribute("href", "vendor-profile.html");

    dashboardForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(dashboardForm);
      const parseItems = (raw) =>
        String(raw || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 10);

      const buildPackage = (idx) => {
        const name = String(data.get(`pkg${idx}Name`) || "").trim();
        const price = String(data.get(`pkg${idx}Price`) || "").trim();
        const items = parseItems(data.get(`pkg${idx}Items`));
        if (!name && !price && items.length === 0) return null;
        return { name: name || `Paquete ${idx}`, price, currency: "EUR", items };
      };

      const nextPackages = [buildPackage(1), buildPackage(2)].filter(Boolean);

      const patch = {
        name: String(data.get("name") || "").trim(),
        category: String(data.get("category") || "").trim(),
        location: String(data.get("location") || "").trim(),
        description: String(data.get("description") || "").trim(),
        contactEmail: String(data.get("contactEmail") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        responseTime: String(data.get("responseTime") || "").trim(),
        availability: String(data.get("availability") || "").trim(),
        packages: nextPackages,
      };

      if (!patch.name) {
        statusEl && (statusEl.textContent = "El nombre comercial es obligatorio.");
        return;
      }

      upsertVendorProfile(session.email, patch);
      if (statusEl) statusEl.textContent = "Guardado.";
      setTimeout(() => {
        if (statusEl) statusEl.textContent = "";
      }, 2200);
    });

    const faqForm = document.querySelector("#vendorFaqForm");
    const faqList = document.querySelector("#vendorFaqList");
    const faqCount = document.querySelector("#vendorFaqCount");
    const faqStatus = document.querySelector("#vendorFaqStatus");

    const getFaqs = () => {
      const fresh = getCurrentVendorProfile();
      const faqs = Array.isArray(fresh?.faqs) ? fresh.faqs : [];
      return faqs
        .filter((f) => f && typeof f === "object")
        .map((f) => ({
          question: String(f.question || "").trim(),
          answer: String(f.answer || "").trim(),
        }))
        .filter((f) => f.question && f.answer)
        .slice(0, 20);
    };

    const renderFaqs = () => {
      if (!faqList) return;
      const faqs = getFaqs();
      faqList.innerHTML = "";
      if (faqCount) faqCount.textContent = String(faqs.length);

      faqs.forEach((faq, index) => {
        const li = document.createElement("li");
        li.className = "faq-admin-item";

        const left = document.createElement("div");
        const q = document.createElement("strong");
        q.textContent = faq.question;
        const a = document.createElement("p");
        a.textContent = faq.answer;
        left.appendChild(q);
        left.appendChild(a);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "faq-remove";
        remove.textContent = "Eliminar";
        remove.addEventListener("click", () => {
          const next = getFaqs().filter((_, i) => i !== index);
          upsertVendorProfile(session.email, { faqs: next });
          renderFaqs();
        });

        li.appendChild(left);
        li.appendChild(remove);
        faqList.appendChild(li);
      });
    };

    renderFaqs();

    faqForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const fd = new FormData(faqForm);
      const question = String(fd.get("question") || "").trim();
      const answer = String(fd.get("answer") || "").trim();
      if (!question || !answer) {
        if (faqStatus) faqStatus.textContent = "Completa pregunta y respuesta.";
        setTimeout(() => {
          if (faqStatus) faqStatus.textContent = "";
        }, 2200);
        return;
      }

      const next = [...getFaqs(), { question, answer }].slice(0, 20);
      upsertVendorProfile(session.email, { faqs: next });
      faqForm.reset();
      if (faqStatus) faqStatus.textContent = "Añadida.";
      setTimeout(() => {
        if (faqStatus) faqStatus.textContent = "";
      }, 1600);
      renderFaqs();
    });
  }
}

const publicNameEl = document.querySelector("#publicVendorName");
if (publicNameEl) {
  const profile = getCurrentVendorProfile();
  if (profile) {
    const leadEl = document.querySelector("#publicVendorLead");
    const categoryEl = document.querySelector("#publicVendorCategory");
    const locationEl = document.querySelector("#publicVendorLocation");
    const ratingEl = document.querySelector("#publicVendorRating");
    const responseEl = document.querySelector("#publicVendorResponseTime");
    const availabilityEl = document.querySelector("#publicVendorAvailability");
    const packagesEl = document.querySelector("#publicVendorPackages");
    const faqEl = document.querySelector("#publicVendorFaq");

    if (profile.name) publicNameEl.textContent = profile.name;
    if (leadEl && profile.description) leadEl.textContent = profile.description;
    if (categoryEl && profile.category) categoryEl.textContent = profile.category;
    if (locationEl && profile.location) locationEl.textContent = profile.location;
    if (ratingEl && profile.rating) ratingEl.textContent = String(profile.rating);
    if (responseEl && profile.responseTime)
      responseEl.textContent = String(profile.responseTime);
    if (availabilityEl && profile.availability)
      availabilityEl.textContent = String(profile.availability);

    if (packagesEl) {
      const packages = Array.isArray(profile.packages) ? profile.packages : [];
      const clean = packages
        .filter((p) => p && typeof p === "object")
        .map((p) => ({
          name: String(p.name || "").trim(),
          price: String(p.price || "").trim(),
          currency: String(p.currency || "EUR").trim(),
          items: Array.isArray(p.items)
            ? p.items.map((x) => String(x).trim()).filter(Boolean)
            : [],
        }))
        .filter((p) => p.name);

      if (clean.length > 0) {
        packagesEl.innerHTML = "";
        clean.forEach((p) => {
          const card = document.createElement("article");
          card.className = "panel pricing-card";

          const top = document.createElement("div");
          const h3 = document.createElement("h3");
          h3.textContent = p.name;
          const price = document.createElement("p");
          price.className = "price";
          price.textContent = p.price
            ? `Desde ${p.price} ${p.currency}`
            : `Consultar ${p.currency}`;
          top.appendChild(h3);
          top.appendChild(price);

          const ul = document.createElement("ul");
          (p.items || []).slice(0, 8).forEach((it) => {
            const li = document.createElement("li");
            li.textContent = it;
            ul.appendChild(li);
          });

          card.appendChild(top);
          card.appendChild(ul);
          packagesEl.appendChild(card);
        });
      }
    }

    if (faqEl) {
      const faqs = Array.isArray(profile.faqs) ? profile.faqs : [];
      const cleanFaqs = faqs
        .filter((f) => f && typeof f === "object")
        .map((f) => ({
          question: String(f.question || "").trim(),
          answer: String(f.answer || "").trim(),
        }))
        .filter((f) => f.question && f.answer);

      if (cleanFaqs.length > 0) {
        faqEl.innerHTML = "";
        cleanFaqs.slice(0, 12).forEach((f) => {
          const details = document.createElement("details");
          const summary = document.createElement("summary");
          summary.textContent = f.question;
          const p = document.createElement("p");
          p.textContent = f.answer;
          details.appendChild(summary);
          details.appendChild(p);
          faqEl.appendChild(details);
        });
      }
    }
  }
}

const CONTACT_FORM_ENDPOINT = "https://formsubmit.co/ajax/contacto@novaboda.es";

document.querySelectorAll(".cta-form").forEach((contactForm) => {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = contactForm.querySelector('button[type="submit"]');
    if (!button) return;

    const originalText = button.textContent;
    button.textContent = "Enviando...";
    button.disabled = true;

    try {
      const formData = new FormData(contactForm);
      formData.append("_captcha", "false");
      formData.append("_subject", "Nueva solicitud desde NOVA BODA");

      const response = await fetch(CONTACT_FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (!response.ok) throw new Error("contact_submit_failed");

      button.textContent = "Solicitud enviada";
      contactForm.reset();
    } catch (error) {
      button.textContent = "No se pudo enviar";
    } finally {
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2400);
    }
  });
});
