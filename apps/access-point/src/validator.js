/**
 * AccessPoint - Input Validator
 * Validates email, password, and confirmation fields.
 */

const Validator = (() => {
    const rules = {
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address.",
        },
        password: {
            minLength: 8,
            requireUppercase: /[A-Z]/,
            requireLowercase: /[a-z]/,
            requireNumber: /[0-9]/,
            requireSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        },
        name: {
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Z\s'-]+$/,
            message:
                "Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes.",
        },
    };

    /**
     * Validate an email address.
     * @param {string} email
     * @returns {{ valid: boolean, message: string }}
     */
    function validateEmail(email) {
        if (!email || !email.trim()) {
            return { valid: false, message: "Email is required." };
        }
        if (!rules.email.pattern.test(email.trim())) {
            return { valid: false, message: rules.email.message };
        }
        return { valid: true, message: "" };
    }

    /**
     * Validate a password and return granular feedback.
     * @param {string} password
     * @returns {{ valid: boolean, message: string, strength: number }}
     */
    function validatePassword(password) {
        if (!password) {
            return {
                valid: false,
                message: "Password is required.",
                strength: 0,
            };
        }

        const errors = [];
        let strength = 0;

        if (password.length >= rules.password.minLength) {
            strength++;
        } else {
            errors.push(`At least ${rules.password.minLength} characters`);
        }

        if (rules.password.requireUppercase.test(password)) {
            strength++;
        } else {
            errors.push("One uppercase letter");
        }

        if (rules.password.requireLowercase.test(password)) {
            strength++;
        } else {
            errors.push("One lowercase letter");
        }

        if (rules.password.requireNumber.test(password)) {
            strength++;
        } else {
            errors.push("One number");
        }

        if (rules.password.requireSpecial.test(password)) {
            strength++;
        } else {
            errors.push("One special character");
        }

        if (errors.length > 0) {
            return {
                valid: false,
                message:
                    "Password must contain: " +
                    errors.join(", ").toLowerCase() +
                    ".",
                strength,
            };
        }

        return { valid: true, message: "", strength };
    }

    /**
     * Validate that the password confirmation matches.
     * @param {string} password
     * @param {string} confirm
     * @returns {{ valid: boolean, message: string }}
     */
    function validateConfirmPassword(password, confirm) {
        if (!confirm) {
            return { valid: false, message: "Please confirm your password." };
        }
        if (password !== confirm) {
            return { valid: false, message: "Passwords do not match." };
        }
        return { valid: true, message: "" };
    }

    /**
     * Validate a display name.
     * @param {string} name
     * @returns {{ valid: boolean, message: string }}
     */
    function validateName(name) {
        if (!name || !name.trim()) {
            return { valid: false, message: "Name is required." };
        }
        const trimmed = name.trim();
        if (
            trimmed.length < rules.name.minLength ||
            trimmed.length > rules.name.maxLength
        ) {
            return { valid: false, message: rules.name.message };
        }
        if (!rules.name.pattern.test(trimmed)) {
            return { valid: false, message: rules.name.message };
        }
        return { valid: true, message: "" };
    }

    return {
        validateEmail,
        validatePassword,
        validateConfirmPassword,
        validateName,
    };
})();
