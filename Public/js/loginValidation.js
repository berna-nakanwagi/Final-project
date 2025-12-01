document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector(".login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailError = document.getElementById("error-email");
    const passwordError = document.getElementById("error-password");

    form.addEventListener("submit", function(e) {
        // Clear previous errors
        emailError.textContent = "";
        passwordError.textContent = "";

        let hasErrors = false;

        // Validate email
        if (emailInput.value.trim() === "") {
            emailError.textContent = "Email is required.";
            emailError.style.color = "red";
            hasErrors = true;
        }

        // Validate password
        if (passwordInput.value.trim() === "") {
            passwordError.textContent = "Password is required.";
            passwordError.style.color = "red";
            hasErrors = true;
        }

        // Stop form submission if errors exist
        if (hasErrors) {
            e.preventDefault();
        }
        // else form submits normally
    });
});
