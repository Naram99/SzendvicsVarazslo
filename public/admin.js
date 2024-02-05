class Admin {
    constructor(selector, renderTo) {
        this.orderBtn = document.querySelector(selector);

        fetch("/lepesek")
            .then((res) => res.json())
            .then((lepesek) => {
                this.steps = lepesek;
                console.log(this.steps);
            });

        this.orderBtn.addEventListener("click", () => {
            fetch("/orderList")
                .then((res) => res.json())
                .then((list) => {
                    this.list = list;
                    this.renderOrders(renderTo, this.list);
                });
        });

        document
            .querySelector(".editor-close")
            .addEventListener("click", () => {
                document.querySelector(".editor").classList.remove("active");
            });
    }

    renderOrders(selector, list) {
        this.content = document.querySelector(selector);

        this.content.innerHTML = "";

        list.forEach((order) => {
            let orderCt = document.createElement("div");
            orderCt.classList.add("order-ct");

            const orderTemplate = `
                <div class="order-name">${order.name}</div>
                <div class="order-parts"></div>
                <div class="order-price">${order.price}</div>
                <div class="order-btns">
                    <button id="del-btn" class="order-btn">Törlés</button>
                </div>
            `;

            orderCt.innerHTML = orderTemplate;

            this.steps.forEach((step) => {
                let lepes = document.createElement("div");
                if (order[step.name]) {
                    order[step.name].forEach((item) => {
                        let part = document.createElement("div");
                        part.innerHTML = item;
                        lepes.appendChild(part);
                    });
                    let editBtn = document.createElement("button");
                    editBtn.classList.add("order-btn");
                    editBtn.classList.add("edit-btn");
                    editBtn.innerHTML = "Módosítás";

                    editBtn.addEventListener("click", () => {
                        this.editOrderStep(step, order.id);
                    });

                    lepes.appendChild(editBtn);

                    orderCt.querySelector(".order-parts").appendChild(lepes);
                }
            });

            orderCt.querySelector("#del-btn").addEventListener("click", () => {
                fetch(`rendeles/${order.id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-type": "application/json",
                    },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log(data);
                        this.orderBtn.click();
                    });
            });

            this.content.appendChild(orderCt);
        });
    }

    /**
     *
     * @param {Object} step
     * @param {Number} id
     */
    editOrderStep(step, id) {
        document.querySelector(".editor").classList.add("active");
        this.editorCt = document.querySelector("#editor-ct");
        this.editorCt.innerHTML = "";

        let name = step.name;

        let file = step.data;

        fetch(`/elemek/${step.data}`)
            .then((res) => res.json())
            .then((data) => {
                this.lepes = data;

                let saveBtn = document.createElement("button");
                saveBtn.classList.add("order-btn");
                saveBtn.innerHTML = "Mentés";

                this.lepes.forEach((elem) => {
                    let elemCt = document.createElement("div");

                    elemCt.innerHTML = elem.name;

                    elemCt.addEventListener("click", () => {
                        elemCt.classList.toggle("activated");
                    });

                    this.editorCt.appendChild(elemCt);
                });

                saveBtn.addEventListener("click", () => {
                    let saves = document.querySelectorAll(".activated");
                    let send = [];
                    saves.forEach((save) => {
                        send.push(save.innerHTML);
                    });
                    fetch(`/rendeles/${id}`, {
                        method: "PATCH",
                        headers: {
                            "Content-type": "application/json",
                        },
                        body: JSON.stringify({ name, send, file }),
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            console.log(data);
                            document.querySelector(".editor-close").click();
                            this.orderBtn.click();
                        })
                        .then();
                });

                this.editorCt.appendChild(saveBtn);
            });
    }
}

new Admin("#orderList", "#content");
