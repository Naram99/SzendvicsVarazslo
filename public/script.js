console.log("SzendvicsVarázsló");

const orderBtn = document.querySelectorAll(".order-btn");
const nextBtn = document.querySelector("#next-btn");
const prevBtn = document.querySelector("#prev-btn");
const closeBtn = document.querySelector("#close-btn");

const orderWindow = document.querySelector(".order-window");

orderBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        orderWindow.classList.add("active");
        let wizard = new Wizard("#window-main", "#next-btn", "#prev-btn");
    });
});

closeBtn.addEventListener("click", () => {
    orderWindow.classList.remove("active");
});
