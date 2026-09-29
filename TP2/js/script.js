"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.querySelector(".button.login");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (loginBtn && usernameInput && passwordInput) {
        loginBtn.addEventListener("click", (e) => {
            if (usernameInput.value.trim() !== "" && passwordInput.value.trim() !== "") {
                e.preventDefault();
                window.location.href = "pages/home.html";
            }
        });
    }
});