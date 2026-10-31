
/* ==========================================
   SAFFRON FLAMES — COMPLETE WEBSITE SCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initMenuCart();
    initReservationForms();
    initOrderPage();
    initNewsletter();
    initGalleryLightbox();
    initSmoothAnchors();
});

/* ---------- MOBILE NAVIGATION ---------- */

function initMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");

    if (!toggle || !links) return;

    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", () => {
        const isOpen = links.classList.toggle("js-menu-open");

        toggle.classList.toggle("js-menu-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });

    links.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            links.classList.remove("js-menu-open");
            toggle.classList.remove("js-menu-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation menu");
        });
    });
}

/* ---------- MESSAGE DISPLAY ---------- */

function showMessage(container, message, success = true) {
    if (!container) {
        alert(message);
        return;
    }

    container.textContent = message;
    container.setAttribute("role", "status");
    container.style.display = "block";
    container.style.marginTop = "12px";
    container.style.padding = "12px";
    container.style.borderRadius = "6px";
    container.style.lineHeight = "1.5";
    container.style.color = success ? "#24452f" : "#7a2525";
    container.style.background = success ? "#edf5eb" : "#fff0ee";
    container.style.border = success
        ? "1px solid #c8dfc5"
        : "1px solid #e9c2bd";
}

/* ---------- CART HELPERS ---------- */

function readCart() {
    try {
        const cart = JSON.parse(
            localStorage.getItem("saffronFlamesCart") || "[]"
        );

        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("saffronFlamesCart", JSON.stringify(cart));
}

function money(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function priceFromText(text) {
    return Number(String(text || "").replace(/[^\d.]/g, "")) || 0;
}

/* ---------- MENU: ADD TO ORDER ---------- */

function initMenuCart() {
    document.querySelectorAll(".dish-card").forEach(card => {
        if (card.querySelector(".sf-add-to-order")) return;

        const title = card.querySelector(".dish-content h3, h3");
        const priceElement = card.querySelector(
            ".dish-content strong, .dish-content .price"
        );

        if (!title || !priceElement) return;

        const name = title.textContent.trim().replace(/\s+/g, " ");
        const price = priceFromText(priceElement.textContent);

        if (!name || !price) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "sf-add-to-order";
        button.textContent = "ADD TO ORDER";

        button.style.cssText =
            "margin-top:12px;padding:10px 14px;" +
            "border:1px solid #b99a4a;border-radius:4px;" +
            "background:#b99a4a;color:#18251b;" +
            "font-weight:600;cursor:pointer;";

        button.addEventListener("click", () => {
            const cart = readCart();
            const existing = cart.find(item => item.name === name);

            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }

            saveCart(cart);
            button.textContent = "ADDED ✓";
            updateCartSummary();

            setTimeout(() => {
                button.textContent = "ADD TO ORDER";
            }, 1200);
        });

        card.appendChild(button);
    });

    updateCartSummary();
}

/* ---------- CART SUMMARY ---------- */

function updateCartSummary() {
    const cart = readCart();

    const totalItems = cart.reduce(
        (sum, item) => sum + Number(item.quantity || 0), 0
    );

    const totalPrice = cart.reduce(
        (sum, item) =>
            sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
    );

    document.querySelectorAll("[data-cart-count], .cart-count")
        .forEach(el => {
            el.textContent = String(totalItems);
        });

    const cartItems = document.querySelector(
        "#cartItems, [data-cart-items]"
    );

    if (cartItems) {
        cartItems.replaceChildren();

        if (cart.length === 0) {
            const empty = document.createElement("p");
            empty.textContent =
                "Your cart is empty. Visit the Menu page to add dishes.";
            cartItems.appendChild(empty);
        } else {
            cart.forEach(item => {
                const row = document.createElement("div");
                row.style.cssText =
                    "display:flex;justify-content:space-between;" +
                    "gap:12px;align-items:center;padding:10px 0;" +
                    "border-bottom:1px solid #ddd;";

                const description = document.createElement("span");
                description.textContent =
                    `${item.name} × ${item.quantity}`;

                const price = document.createElement("strong");
                price.textContent = money(
                    Number(item.price) * Number(item.quantity)
                );

                const remove = document.createElement("button");
                remove.type = "button";
                remove.textContent = "Remove";

                remove.addEventListener("click", () => {
                    saveCart(
                        readCart().filter(
                            cartItem => cartItem.name !== item.name
                        )
                    );
                    updateCartSummary();
                });

                const right = document.createElement("span");
                right.append(price, remove);
                row.append(description, right);
                cartItems.appendChild(row);
            });
        }
    }

    document.querySelectorAll("#cartTotal, [data-cart-total]")
        .forEach(el => {
            el.textContent = money(totalPrice);
        });

    document.querySelectorAll("#cartItemCount, [data-cart-item-count]")
        .forEach(el => {
            el.textContent = String(totalItems);
        });
}
/* ---------- RESERVATION FORM ---------- */

function initReservationForms() {
    document.querySelectorAll(
        "#reservationForm, form.reservation-form"
    ).forEach(form => {
        if (form.dataset.sfReservationReady === "true") return;
        form.dataset.sfReservationReady = "true";

        const dateInput = form.querySelector(
            'input[type="date"], #reservationDate'
        );

        if (dateInput) {
            const today = new Date();
            const localDate =
                today.getFullYear() + "-" +
                String(today.getMonth() + 1).padStart(2, "0") + "-" +
                String(today.getDate()).padStart(2, "0");

            dateInput.min = localDate;
        }

        form.addEventListener("submit", function (event) {
            const isEmailConnected =
                form.action &&
                form.action.includes("formsubmit.co");

            // Let FormSubmit send connected forms normally.
            if (isEmailConnected) {
                return;
            }

            // This form is only in preview/demo mode.
            event.preventDefault();

            const message =
                form.querySelector("#reservationMessage") ||
                document.querySelector("#reservationMessage");

            if (message) {
                message.textContent =
                    "Reservation form preview only. To receive reservations by email, connect this form to FormSubmit.";
                message.style.color = "#b8860b";
            } else {
                alert(
                    "This reservation form is not connected to email yet."
                );
            }
        });
    });
}


/* ---------- ORDER FORM ---------- */

function initOrderPage() {
    if (typeof updateCartSummary === "function") {
        updateCartSummary();
    }

    document.querySelectorAll(
        "#orderForm, #checkoutForm, form[data-order-form]"
    ).forEach(form => {
        if (form.dataset.sfOrderReady === "true") return;
        form.dataset.sfOrderReady = "true";

        form.addEventListener("submit", function (event) {
            const isEmailConnected =
                form.action &&
                form.action.includes("formsubmit.co");

            let cart = [];

            try {
                cart = JSON.parse(
                    localStorage.getItem("saffronFlamesCart") || "[]"
                );
            } catch (error) {
                cart = [];
            }

            // Do not send an empty cart.
            if (cart.length === 0) {
                event.preventDefault();
                alert("Your order is empty. Please add dishes first.");
                return;
            }

            const orderDetails = cart.map(item => {
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;

                return (
                    (item.name || "Dish") +
                    " x " + quantity +
                    " — ₹" + (price * quantity).toFixed(2)
                );
            }).join("\n");

            const orderTotal = cart.reduce((total, item) => {
                return total +
                    (Number(item.price) || 0) *
                    (Number(item.quantity) || 1);
            }, 0);

            if (isEmailConnected) {
                // Add order information to the email.
                addHiddenField(form, "Order_Details", orderDetails);
                addHiddenField(
                    form,
                    "Order_Total",
                    "₹" + orderTotal.toFixed(2)
                );

                // Allow the browser to submit the form to FormSubmit.
                return;
            }

            // Demo mode: this does not send an email or real order.
            event.preventDefault();

            try {
                localStorage.setItem(
                    "saffronFlamesDemoOrder",
                    JSON.stringify({
                        items: cart,
                        total: orderTotal,
                        createdAt: new Date().toISOString()
                    })
                );
            } catch (error) {
                console.warn("Could not save demo order.", error);
            }

            alert(
                "Demo order saved in this browser only. " +
                "Connect the form to an email service to receive customer orders."
            );
        });
    });
}


/* ---------- ADD HIDDEN FORM FIELDS ---------- */

function addHiddenField(form, fieldName, fieldValue) {
    let field = form.querySelector(
        'input[name="' + fieldName + '"]'
    );

    if (!field) {
        field = document.createElement("input");
        field.type = "hidden";
        field.name = fieldName;
        form.appendChild(field);
    }

    field.value = fieldValue;
}

/* ---------- NEWSLETTER ---------- */

function initNewsletter() {
    document.querySelectorAll(
        "#newsletterForm, form.newsletter-form"
    ).forEach(form => {
        if (form.dataset.sfNewsletterReady === "true") return;
        form.dataset.sfNewsletterReady = "true";

        form.addEventListener("submit", function (event) {
            const connected =
                form.action &&
                form.action.includes("formsubmit.co");

            if (connected) return;

            event.preventDefault();

            alert(
                "Newsletter preview only. Connect an email service to receive subscriptions."
            );
        });
    });
}


/* ---------- GALLERY LIGHTBOX ---------- */

function initGalleryLightbox() {
    const images = document.querySelectorAll(
        ".gallery img, .gallery-grid img, .gallery-item img"
    );

    images.forEach(img => {
        if (img.dataset.sfLightboxReady === "true") return;
        img.dataset.sfLightboxReady = "true";

        img.style.cursor = "zoom-in";

        img.addEventListener("click", function () {
            const overlay = document.createElement("div");

            overlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.90);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                z-index: 99999;
                cursor: zoom-out;
            `;

            const largeImage = document.createElement("img");
            largeImage.src = img.src;
            largeImage.alt = img.alt || "Restaurant gallery image";

            largeImage.style.cssText = `
                max-width: 95%;
                max-height: 90vh;
                object-fit: contain;
                border-radius: 10px;
            `;

            overlay.appendChild(largeImage);
            document.body.appendChild(overlay);

            overlay.addEventListener("click", function () {
                overlay.remove();
            });

            document.addEventListener("keydown", function closeOnEscape(e) {
                if (e.key === "Escape") {
                    overlay.remove();
                    document.removeEventListener("keydown", closeOnEscape);
                }
            });
        });
    });
}


/* ---------- SMOOTH PAGE ANCHORS ---------- */

function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", function (event) {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
}

/* OPEN CUSTOMER CHECKOUT */

document.addEventListener("DOMContentLoaded", function () {
    const checkoutButton =
        document.getElementById("checkoutButton");

    const orderForm =
        document.getElementById("orderForm");

    if (checkoutButton && orderForm) {
        checkoutButton.addEventListener("click", function () {
            orderForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    }
});
