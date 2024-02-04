console.log("SzendvicsVarázsló");

const orderBtn = document.querySelectorAll(".order-btn");
const closeBtn = document.querySelector("#close-btn");
const loginBtn = document.querySelector("#check-btn");

const orderWindow = document.querySelector(".order-window");

orderBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        orderWindow.classList.add("active");
        let wizard = new Wizard("#window-main", "#next-btn", "#prev-btn");
    });
});

closeBtn.addEventListener("click", () => {
    orderWindow.classList.remove("active");
    wizard.steps = -1;
    wizard.list.innerHTML = "";
});

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const userName = document.querySelector("#login-user").value.trim();
        const password = document.querySelector("#login-pw").value.trim();

        fetch("/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({ userName, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.logged) location.reload();
                else alert(data.msg);
            });
    });
}
