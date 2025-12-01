document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("register-form");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const roleInput = document.getElementById("role");
    const passwordInput = document.getElementById("password");

    const usernameError = document.getElementById("error-username");
    const emailError = document.getElementById("error-email");
    const roleError = document.getElementById("error-role");
    const passwordError = document.getElementById("error-password");

    form.addEventListener("submit", function(e) {
        // Clear previous errors
        usernameError.textContent = "";
        emailError.textContent = "";
        roleError.textContent = "";
        passwordError.textContent = "";

        let hasErrors = false;

        // Username validation
        if (usernameInput.value.trim() === "") {
            usernameError.textContent = "Username is required.";
            usernameError.style.color = "red";
            hasErrors = true;
        } else if (usernameInput.value.trim().length < 3) {
            usernameError.textContent = "Username must be at least 3 characters.";
            usernameError.style.color = "red";
            hasErrors = true;
        }

        // Email validation without regex
        const emailValue = emailInput.value.trim();
        const atIndex = emailValue.indexOf("@");
        const dotIndex = emailValue.lastIndexOf(".");
        if (emailValue === "") {
            emailError.textContent = "Email is required.";
            emailError.style.color = "red";
            hasErrors = true;
        } else if (
            atIndex < 1 ||           // @ cannot be first character
            dotIndex < atIndex + 2 || // . must be after @
            dotIndex === emailValue.length - 1 // cannot end with .
        ) {
            emailError.textContent = "Enter a valid email address.";
            emailError.style.color = "red";
            hasErrors = true;
        }

        // Role validation
        if (roleInput.value === "") {
            roleError.textContent = "Please select a role.";
            roleError.style.color = "red";
            hasErrors = true;
        }

        // Password validation
        if (passwordInput.value.trim() === "") {
            passwordError.textContent = "Password is required.";
            passwordError.style.color = "red";
            hasErrors = true;
        } else if (passwordInput.value.trim().length < 6) {
            passwordError.textContent = "Password must be at least 6 characters.";
            passwordError.style.color = "red";
            hasErrors = true;
        }

        if (hasErrors) {
            e.preventDefault(); // Stop form submission
        }
    });
});
