/**
 * AccessPoint - Password Recovery Module
 * Handles the password reset flow: request token, validate, and reset.
 */

const Recovery = (() => {
    const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

    /**
     * Request a password reset for the given email.
     * Generates a token and stores it.  In a real app this would send an email.
     * @param {string} email
     * @returns {{ success: boolean, message: string, token?: string }}
     */
    function requestReset(email) {
        const user = Storage.findUserByEmail(email);
        if (!user) {
            // Intentionally vague to avoid user enumeration
            return {
                success: true,
                message:
                    "If an account with that email exists, a reset link has been sent.",
            };
        }

        const token = Utils.generateToken();
        Storage.saveResetToken({
            token,
            email: user.email,
            userId: user.id,
            createdAt: Date.now(),
            expiresAt: Date.now() + TOKEN_EXPIRY_MS,
        });

        // In production this token would be emailed, not returned directly.
        return {
            success: true,
            message:
                "If an account with that email exists, a reset link has been sent.",
            token, // exposed only for demo purposes
        };
    }

    /**
     * Validate a reset token.
     * @param {string} token
     * @returns {{ valid: boolean, message: string, email?: string }}
     */
    function validateToken(token) {
        const record = Storage.findResetToken(token);
        if (!record) {
            return { valid: false, message: "Invalid or expired reset token." };
        }
        if (Date.now() > record.expiresAt) {
            Storage.removeResetToken(token);
            return {
                valid: false,
                message:
                    "This reset token has expired. Please request a new one.",
            };
        }
        return { valid: true, message: "", email: record.email };
    }

    /**
     * Reset the password using a valid token.
     * @param {string} token
     * @param {string} newPassword
     * @returns {{ success: boolean, message: string }}
     */
    function resetPassword(token, newPassword) {
        const validation = validateToken(token);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        const passwordCheck = Validator.validatePassword(newPassword);
        if (!passwordCheck.valid) {
            return { success: false, message: passwordCheck.message };
        }

        const user = Storage.findUserByEmail(validation.email);
        if (!user) {
            return { success: false, message: "User account not found." };
        }

        Storage.updateUser(user.id, {
            passwordHash: Utils.hashPassword(newPassword),
            updatedAt: Date.now(),
        });
        Storage.removeResetToken(token);

        return {
            success: true,
            message: "Your password has been reset successfully.",
        };
    }

    return { requestReset, validateToken, resetPassword };
})();
