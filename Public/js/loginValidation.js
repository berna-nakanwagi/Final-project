document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  // simple and easy email checker
  function isValidEmail(value) {
    // must contain @ and .
    if (!value.includes("@")) return false;
    if (!value.includes(".")) return false;
    return true;
  }

  form.addEventListener("submit", (e) => {
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    // email validation
    if (!isValidEmail(emailValue)) {
      alert("Please enter a valid email address.");
      e.preventDefault();
      return;
    }

    // password validation (at least 6 characters)
    if (passwordValue.length < 6) {
      alert("Password must be at least 6 characters long.");
      e.preventDefault();
      return;
    }
  });
});