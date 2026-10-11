/**
 * AccessPoint - Authentication Controller
 * Core auth operations: register, login, logout.
 */

const AuthController = (() => {
    /**
     * Register a new user.
     * @param {{ name: string, email: string, password: string, confirmPassword: string }} data
     * @returns {{ success: boolean, message: string, user?: object }}
     */
    function register({ name, email, password, confirmPassword }) {
        // Validate inputs
        const nameCheck = Validator.validateName(name);
        if (!nameCheck.valid)
            return { success: false, message: nameCheck.message };

        const emailCheck = Validator.validateEmail(email);
        if (!emailCheck.valid)
            return { success: false, message: emailCheck.message };

        const passwordCheck = Validator.validatePassword(password);
        if (!passwordCheck.valid)
            return { success: false, message: passwordCheck.message };

        const confirmCheck = Validator.validateConfirmPassword(
            password,
            confirmPassword,
        );
        if (!confirmCheck.valid)
            return { success: false, message: confirmCheck.message };

        // Check for duplicate email
        if (Storage.findUserByEmail(email)) {
            return {
                success: false,
                message: "An account with this email already exists.",
            };
        }

        // Create account
        const user = Storage.createUser({
            id: Utils.generateId(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            passwordHash: Utils.hashPassword(password),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Auto-login
        Session.create(user);

        return {
            success: true,
            message: "Account created successfully!",
            user: { id: user.id, name: user.name, email: user.email },
        };
    }

    /**
     * Log in an existing user.
     * @param {{ email: string, password: string }} data
     * @returns {{ success: boolean, message: string, user?: object }}
     */
    function login({ email, password }) {
        const emailCheck = Validator.validateEmail(email);
        if (!emailCheck.valid)
            return { success: false, message: emailCheck.message };

        if (!password)
            return { success: false, message: "Password is required." };

        const user = Storage.findUserByEmail(email);
        if (!user || !Utils.verifyPassword(password, user.passwordHash)) {
            return { success: false, message: "Invalid email or password." };
        }

        Session.create(user);

        return {
            success: true,
            message: "Logged in successfully!",
            user: { id: user.id, name: user.name, email: user.email },
        };
    }

    /**
     * Log out the current user.
     * @returns {{ success: boolean, message: string }}
     */
    function logout() {
        Session.destroy();
        return { success: true, message: "You have been logged out." };
    }

    /**
     * Get the currently authenticated user's profile.
     * @returns {object|null}
     */
    function getCurrentUser() {
        const session = Session.get();
        if (!session) return null;
        const user = Storage.findUserById(session.userId);
        if (!user) return null;
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        };
    }

    return { register, login, logout, getCurrentUser };
})();
