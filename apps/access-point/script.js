/**
 * AccessPoint — Main Entry Point
 * Wires up all form submissions, navigation links, and real-time validation.
 */

(function () {
    "use strict";

    // ── Boot ─────────────────────────────────────────────

    document.addEventListener("DOMContentLoaded", () => {
        UIController.init();
        routeOnLoad();
        bindNavigation();
        bindForms();
        bindPasswordToggles();
        bindRealTimeValidation();
    });

    // ── Routing ──────────────────────────────────────────

    function routeOnLoad() {
        if (Session.isAuthenticated()) {
            const user = AuthController.getCurrentUser();
            if (user) {
                UIController.renderDashboard(user);
                UIController.showView("dashboard");
                return;
            }
        }
        UIController.showView("login");
    }

    // ── Navigation Links ─────────────────────────────────

    function bindNavigation() {
        on("link-to-register", "click", (e) => {
            e.preventDefault();
            UIController.showView("register");
        });
        on("link-to-recovery", "click", (e) => {
            e.preventDefault();
            UIController.showView("recovery");
        });
        on("link-to-login-from-register", "click", (e) => {
            e.preventDefault();
            UIController.showView("login");
        });
        on("link-to-login-from-recovery", "click", (e) => {
            e.preventDefault();
            UIController.showView("login");
        });
        on("link-to-login-from-reset", "click", (e) => {
            e.preventDefault();
            UIController.showView("login");
        });
        on("btn-logout", "click", () => {
            AuthController.logout();
            UIController.showView("login");
        });
    }

    // ── Form Submissions ─────────────────────────────────

    function bindForms() {
        // Login
        formOn("form-login", (form) => {
            const email = val("login-email");
            const password = val("login-password");

            const btn = form.querySelector(".btn--primary");
            UIController.setLoading(btn, true);

            // Simulate async
            setTimeout(() => {
                const result = AuthController.login({ email, password });
                UIController.setLoading(btn, false);

                if (!result.success) {
                    UIController.showMessage(
                        "login-message",
                        result.message,
                        "error",
                    );
                    return;
                }

                const user = AuthController.getCurrentUser();
                UIController.renderDashboard(user);
                UIController.showView("dashboard");
            }, 400);
        });

        // Register
        formOn("form-register", (form) => {
            const name = val("register-name");
            const email = val("register-email");
            const password = val("register-password");
            const confirmPassword = val("register-confirm");

            // Inline validation
            let hasError = false;
            const nameCheck = Validator.validateName(name);
            if (!nameCheck.valid) {
                UIController.setFieldError(
                    el("register-name"),
                    nameCheck.message,
                );
                hasError = true;
            }
            const emailCheck = Validator.validateEmail(email);
            if (!emailCheck.valid) {
                UIController.setFieldError(
                    el("register-email"),
                    emailCheck.message,
                );
                hasError = true;
            }
            const pwCheck = Validator.validatePassword(password);
            if (!pwCheck.valid) {
                UIController.setFieldError(
                    el("register-password"),
                    pwCheck.message,
                );
                hasError = true;
            }
            const confirmCheck = Validator.validateConfirmPassword(
                password,
                confirmPassword,
            );
            if (!confirmCheck.valid) {
                UIController.setFieldError(
                    el("register-confirm"),
                    confirmCheck.message,
                );
                hasError = true;
            }
            if (hasError) return;

            const btn = form.querySelector(".btn--primary");
            UIController.setLoading(btn, true);

            setTimeout(() => {
                const result = AuthController.register({
                    name,
                    email,
                    password,
                    confirmPassword,
                });
                UIController.setLoading(btn, false);

                if (!result.success) {
                    UIController.showMessage(
                        "register-message",
                        result.message,
                        "error",
                    );
                    return;
                }

                const user = AuthController.getCurrentUser();
                UIController.renderDashboard(user);
                UIController.showView("dashboard");
            }, 400);
        });

        // Recovery (request token)
        formOn("form-recovery", (form) => {
            const email = val("recovery-email");

            const emailCheck = Validator.validateEmail(email);
            if (!emailCheck.valid) {
                UIController.setFieldError(
                    el("recovery-email"),
                    emailCheck.message,
                );
                return;
            }

            const btn = form.querySelector(".btn--primary");
            UIController.setLoading(btn, true);

            setTimeout(() => {
                const result = Recovery.requestReset(email);
                UIController.setLoading(btn, false);

                UIController.showMessage(
                    "recovery-message",
                    result.message,
                    "success",
                );

                // Show the token for demo purposes
                if (result.token) {
                    const tokenDisplay = document.getElementById(
                        "recovery-token-display",
                    );
                    const tokenValue = document.getElementById(
                        "recovery-token-value",
                    );
                    if (tokenDisplay && tokenValue) {
                        tokenValue.textContent = result.token;
                        tokenDisplay.hidden = false;
                    }

                    // Add a link to go to the reset form
                    setTimeout(() => {
                        UIController.showView("reset");
                        el("reset-token").value = result.token;
                    }, 1500);
                }
            }, 400);
        });

        // Reset (set new password)
        formOn("form-reset", (form) => {
            const token = val("reset-token");
            const password = val("reset-password");
            const confirm = val("reset-confirm");

            let hasError = false;

            if (!token.trim()) {
                UIController.setFieldError(
                    el("reset-token"),
                    "Reset token is required.",
                );
                hasError = true;
            }

            const pwCheck = Validator.validatePassword(password);
            if (!pwCheck.valid) {
                UIController.setFieldError(
                    el("reset-password"),
                    pwCheck.message,
                );
                hasError = true;
            }

            const confirmCheck = Validator.validateConfirmPassword(
                password,
                confirm,
            );
            if (!confirmCheck.valid) {
                UIController.setFieldError(
                    el("reset-confirm"),
                    confirmCheck.message,
                );
                hasError = true;
            }

            if (hasError) return;

            const btn = form.querySelector(".btn--primary");
            UIController.setLoading(btn, true);

            setTimeout(() => {
                const result = Recovery.resetPassword(token.trim(), password);
                UIController.setLoading(btn, false);

                if (!result.success) {
                    UIController.showMessage(
                        "reset-message",
                        result.message,
                        "error",
                    );
                    return;
                }

                UIController.showMessage(
                    "reset-message",
                    result.message,
                    "success",
                );
                setTimeout(() => UIController.showView("login"), 1500);
            }, 400);
        });
    }

    // ── Real-Time Validation ─────────────────────────────

    function bindRealTimeValidation() {
        // Password strength meter
        el("register-password")?.addEventListener(
            "input",
            Utils.debounce((e) => {
                const result = Validator.validatePassword(e.target.value);
                UIController.updateStrengthMeter(result.strength);
                if (e.target.value && !result.valid) {
                    UIController.setFieldError(e.target, result.message);
                } else {
                    UIController.clearFieldError(e.target);
                }
            }, 150),
        );

        // Clear field errors on focus
        document.querySelectorAll(".field__input").forEach((input) => {
            input.addEventListener("focus", () =>
                UIController.clearFieldError(input),
            );
        });
    }

    // ── Password Toggle ──────────────────────────────────

    function bindPasswordToggles() {
        document.querySelectorAll(".field__toggle-pw").forEach((btn) => {
            btn.addEventListener("click", () => {
                const target = document.getElementById(btn.dataset.target);
                if (!target) return;

                const isPassword = target.type === "password";
                target.type = isPassword ? "text" : "password";

                const eyeOpen = btn.querySelector(".icon-eye");
                const eyeOff = btn.querySelector(".icon-eye-off");
                if (eyeOpen)
                    eyeOpen.style.display = isPassword ? "none" : "block";
                if (eyeOff)
                    eyeOff.style.display = isPassword ? "block" : "none";
            });
        });
    }

    // ── Helpers ──────────────────────────────────────────

    function el(id) {
        return document.getElementById(id);
    }

    function val(id) {
        return el(id)?.value ?? "";
    }

    function on(id, event, handler) {
        el(id)?.addEventListener(event, handler);
    }

    function formOn(id, handler) {
        const form = el(id);
        if (!form) return;
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            handler(form);
        });
    }
})();
