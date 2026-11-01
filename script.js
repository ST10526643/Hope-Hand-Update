document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".site-nav");

if (menuToggle instanceof HTMLButtonElement && siteNavigation instanceof HTMLElement) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNavigation.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    siteNavigation.classList.toggle("is-open", !isExpanded);
  });

  siteNavigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
}

const serviceFilter = document.querySelector("#service-filter");
const serviceCards = Array.from(document.querySelectorAll("[data-service]"));
const serviceResults = document.querySelector("#service-results");

if (
  serviceFilter instanceof HTMLInputElement &&
  serviceResults instanceof HTMLElement &&
  serviceCards.length > 0
) {
  serviceFilter.addEventListener("input", () => {
    const query = serviceFilter.value.trim().toLocaleLowerCase();
    let visibleCount = 0;

    serviceCards.forEach((card) => {
      const matches = card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) {
        visibleCount += 1;
      }
    });

    serviceResults.textContent =
      query.length === 0
        ? `Showing all ${serviceCards.length} services.`
        : `Showing ${visibleCount} of ${serviceCards.length} matching services.`;
  });
}

const imageDialog = document.querySelector(".image-dialog");

if (typeof HTMLDialogElement !== "undefined" && imageDialog instanceof HTMLDialogElement) {
  const dialogImage = imageDialog.querySelector(".dialog-image");
  const closeButton = imageDialog.querySelector(".dialog-close");

  if (dialogImage instanceof HTMLImageElement && closeButton instanceof HTMLButtonElement) {
    document.querySelectorAll(".gallery-trigger").forEach((trigger) => {
      if (!(trigger instanceof HTMLButtonElement)) {
        return;
      }

      trigger.addEventListener("click", () => {
        const sourceImage = trigger.querySelector("img");
        if (!(sourceImage instanceof HTMLImageElement)) {
          return;
        }

        dialogImage.src = sourceImage.currentSrc || sourceImage.src;
        dialogImage.alt = sourceImage.alt;
        imageDialog.showModal();
      });
    });

    closeButton.addEventListener("click", () => imageDialog.close());
    imageDialog.addEventListener("click", (event) => {
      if (event.target === imageDialog) {
        imageDialog.close();
      }
    });
  }
}

const validationMessage = (field) => {
  const value = field.value.trim();
  if (field.required && value.length === 0) {
    return "Please complete this required field.";
  }
  if (field.validity.typeMismatch && field.type === "email") {
    return "Enter an email address in the format name@example.com.";
  }
  if (field.type === "tel" && field.value.length > 0) {
    const digitCount = field.value.replace(/\D/g, "").length;
    if (field.validity.patternMismatch || digitCount < 7) {
      return "Enter a valid phone number using 7 to 20 digits, spaces, dots or hyphens; an initial plus is allowed.";
    }
  }
  if (field.minLength > 0 && value.length < field.minLength) {
    return `Enter at least ${field.minLength} characters.`;
  }
  if (field.validity.tooLong) {
    return `Use no more than ${field.maxLength} characters.`;
  }
  return "";
};

document.querySelectorAll("[data-message-form]").forEach((form) => {
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const status = form.querySelector("[data-form-status]");
  const preparedSection = form.querySelector("[data-prepared-message]");
  const preparedText = form.querySelector("[data-prepared-text]");
  const formFields = form.querySelector("[data-form-fields]");
  const submitButton = form.querySelector(".form-submit");
  const copyButton = form.querySelector("[data-copy-message]");
  const copyStatus = form.querySelector("[data-copy-status]");
  let isPreparing = false;

  if (
    !(status instanceof HTMLElement) ||
    !(preparedSection instanceof HTMLElement) ||
    !(preparedText instanceof HTMLTextAreaElement) ||
    !(formFields instanceof HTMLFieldSetElement) ||
    !(submitButton instanceof HTMLButtonElement) ||
    !(copyButton instanceof HTMLButtonElement) ||
    !(copyStatus instanceof HTMLElement)
  ) {
    return;
  }

  formFields.disabled = false;
  const fields = Array.from(form.querySelectorAll("input[name], select[name], textarea[name]"));

  const clearFieldError = (field) => {
    const error = document.getElementById(`${field.id}-error`);
    if (error) {
      error.textContent = "";
    }
    field.removeAttribute("aria-invalid");
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
    field.addEventListener("change", () => clearFieldError(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (isPreparing) {
      return;
    }

    let firstInvalidField = null;
    fields.forEach((field) => {
      const error = document.getElementById(`${field.id}-error`);
      const message = validationMessage(field);

      if (error) {
        error.textContent = message;
      }
      if (message) {
        field.setAttribute("aria-invalid", "true");
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      } else {
        field.removeAttribute("aria-invalid");
      }
    });

    if (firstInvalidField) {
      status.textContent = "Please correct the highlighted fields and try again.";
      firstInvalidField.focus();
      preparedSection.hidden = true;
      return;
    }

    isPreparing = true;
    submitButton.disabled = true;
    status.textContent = "Preparing your message…";

    const labels = {
      name: "Name",
      email: "Email",
      phone: "Phone",
      category: "Category",
      type: "Message type",
      message: "Message",
    };
    const entries = Array.from(new FormData(form).entries())
      .filter(([key]) => Object.hasOwn(labels, key))
      .map(([key, value]) => `${labels[key]}: ${String(value).trim()}`);

    preparedText.value = [
      form.dataset.formName || "HopeHands message",
      "",
      ...entries,
      "",
      "Prepared in the browser. This message has not been sent.",
    ].join("\n");

    preparedSection.hidden = false;
    copyStatus.textContent = "";
    status.textContent = "Your message has been prepared on this device only; it has not been sent.";
    submitButton.disabled = false;
    isPreparing = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    preparedSection.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(preparedText.value);
      copyStatus.textContent = "Message copied. It has not been sent.";
    } catch {
      preparedText.focus();
      preparedText.select();
      copyStatus.textContent = "Automatic copying was unavailable. The message is selected; copy it manually.";
    }
  });
});
