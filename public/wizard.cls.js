class Wizard {
    static template = `
        <h2 class="window-text">Üdvözlünk a SzendóMágus egyedi szendvicsrendelő appjában!</h2>
        <p class="window-fill">A folytatáshoz kattints a tovább gombra.</p>`;

    static preview = `
        <div class="preview-text"></div>
        <div class="preview-pics"></div>
        `;

    constructor(renderTo, nextBtn, prevBtn, sandwichName = "", id = 0) {
        console.log("Wizard");

        this.content = document.querySelector(renderTo);
        this.content.innerHTML = Wizard.template;

        this.preview = document.createElement("div");
        this.preview.classList.add("preview-ct");
        this.preview.innerHTML = Wizard.preview;

        this.list = document.createElement("div");
        this.list.classList.add("list-ct");

        this.content.insertAdjacentElement("afterend", this.preview);
        this.content.insertAdjacentElement("afterend", this.list);

        this.nextBtn = document.querySelector(nextBtn);
        this.prevBtn = document.querySelector(prevBtn);

        this.sandwich = {
            price: 0,
            name: sandwichName,
            id: id,
        };

        fetch("/lepesek")
            .then((res) => res.json())
            .then((lepesek) => {
                this.steps = lepesek;
                console.log(this.steps);
            });

        this.step = -1;

        this.nextBtn.addEventListener("click", () => {
            if (
                document.querySelector("#order-name") &&
                this.sandwich.name == ""
            ) {
                this.sandwich.name = document
                    .querySelector("#order-name")
                    .value.trim();
            }
            this.next();
        });

        this.prevBtn.addEventListener("click", () => {
            this.previous();
        });
    }

    next() {
        let valid = this.validate();
        if (valid) {
            if (this.step > -1 && this.steps[this.step])
                this.sandwichUpdate(".activated", this.items);

            this.step++;
            if (this.steps[this.step]) {
                fetch(`/elemek/${this.steps[this.step].data}`)
                    .then((res) => res.json())
                    .then((elemek) => {
                        this.items = elemek;
                        this.render(
                            this.items,
                            this.steps[this.step].multiselect,
                            this.steps[this.step].optional
                        );
                    });

                this.content.innerHTML = `
                    <div class="window-text">${
                        this.steps[this.step].text
                    }</div>`;
            } else if (this.step == this.steps.length) {
                this.content.innerHTML = `
                    <div class="window-text">Kérlek add meg a neved a rendelés véglegesítéséhez!</div>
                    <input type="text" id="order-name" value="${this.sandwich.name}"/>
                `;
                this.list.innerHTML = "";
            } else if (this.step == this.steps.length + 1) {
                this.content.innerHTML = `<div class="window-text">Kedves ${this.sandwich.name}, az összeállított szendvicsed így néz ki: </div>`;
                this.list.innerHTML = ``;

                for (let lepes of this.steps) {
                    let prevTxt = document.createElement("div");
                    prevTxt.classList.add("window-text");
                    prevTxt.innerHTML = "";
                    for (let item of this.sandwich[lepes.name]) {
                        if (item == "Nem kérek") continue;
                        prevTxt.innerHTML += item + " ";
                    }
                    this.content.appendChild(prevTxt);
                }

                this.kenyerTop = document.createElement("img");
                this.kenyerTop.classList.add("preview-img");

                let source = this.sandwich.KenyerPic[0]
                    .split("undefined")
                    .pop()
                    .split(".");
                console.log(source);

                this.kenyerTop.src = `./pics/${source[0]}Top.png`;
                this.previewPic.appendChild(this.kenyerTop);
            } else if (this.step == this.steps.length + 2) {
                this.content.innerHTML = "Köszönjük a rendelést!";
                console.log(this.sandwich);
                fetch("/szendvics", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify(this.sandwich),
                });
            } else {
                location.reload();
            }
        }
    }

    previous() {
        this.step--;
        if (this.steps[this.step]) {
            fetch(`/elemek/${this.steps[this.step].data}`)
                .then((res) => res.json())
                .then((elemek) => {
                    this.items = elemek;
                    this.render(
                        this.items,
                        this.steps[this.step].multiselect,
                        this.steps[this.step].optional
                    );
                });

            this.content.innerHTML = `
                <div class="window-text">${this.steps[this.step].text}</div>`;
        } else if (this.step == this.steps.length) {
            this.content.innerHTML = `
                <div class="window-text">Kérlek add meg a neved a rendelés véglegesítéséhez!</div>
                <input type="text" id="order-name" value="${this.sandwich.name}"/>
            `;
            this.list.innerHTML = "";
        } else if (this.step == this.steps.length + 1) {
            this.content.innerHTML = `<div class="window-text">Kedves ${this.sandwich.name}, az összeállított szendvicsed így néz ki: </div>`;
            this.list.innerHTML = ``;

            for (let lepes of this.steps) {
                let prevTxt = document.createElement("div");
                prevTxt.classList.add("window-text");
                prevTxt.innerHTML = "";
                for (let item of this.sandwich[lepes.name]) {
                    if (item == "Nem kérek") continue;
                    prevTxt.innerHTML += item + " ";
                }
                this.content.appendChild(prevTxt);
            }

            this.kenyerTop = document.createElement("img");
            this.kenyerTop.classList.add("preview-img");

            let source = this.sandwich.KenyerPic[0]
                .split("undefined")
                .pop()
                .split(".");
            console.log(source);

            this.kenyerTop.src = `./pics/${source[0]}Top.png`;
            this.previewPic.appendChild(this.kenyerTop);
        }
    }

    validate() {
        if (this.step > -1 && this.steps[this.step]) {
            let validator = document.querySelector(".activated");
            if (validator) return true;
            return false;
        }
        return true;
    }

    /**
     *
     * @param {Array} elemek
     * @param {Boolean} multiSelect
     * @param {Boolean} optional
     */
    render(elemek, multiSelect, optional) {
        this.list.innerHTML = "";

        for (let elem of elemek) {
            this.listCard = document.createElement("div");
            this.listCard.classList.add("list-card");
            this.listCard.innerHTML = `
                <div class="list-id">${elem.id}</div>
                <div class="list-name">${elem.name}</div>
                <img 
                    src="./pics/${elem.image}" 
                    class="list-img" 
                />
                <div class="list-price">${elem.price} Ft</div>
            `;
            this.list.appendChild(this.listCard);
        }
        if (optional) {
            this.listCard = document.createElement("div");
            //this.listCard.classList.add("list-card");
            this.listCard.classList.add("no-card");
            this.listCard.innerHTML = `
                <div class="list-id">99</div>
                <div class="list-name">Nem kérek</div>
                <img 
                    src="./pics/noPic.png" 
                    class="list-img" 
                />
                <div class="list-price">0 Ft</div>
            `;
            this.list.appendChild(this.listCard);
        }
        this.cardSelect(".list-card", multiSelect);
    }

    /**
     *
     * @param {String} selector
     * @param {Boolean} multiSelect
     */
    cardSelect(selector, multiSelect) {
        this.cards = document.querySelectorAll(selector);
        this.deny = document.querySelector(".no-card");

        this.cards.forEach((card) => {
            card.addEventListener("click", () => {
                if (!multiSelect) {
                    const selected = document.querySelector(".activated");
                    if (selected) selected.classList.remove("activated");
                }
                card.classList.toggle("activated");
                if (this.deny) this.deny.classList.remove("activated");
            });
        });

        if (this.deny) {
            this.deny.addEventListener("click", () => {
                const selected = document.querySelectorAll(".activated");
                selected.forEach((select) => {
                    select.classList.remove("activated");
                });
                this.deny.classList.add("activated");
            });
        }
    }

    /**
     *
     * @param {String} selector
     * @param {Array} elemek
     */
    sandwichUpdate(selector, elemek) {
        this.updates = document.querySelectorAll(selector);

        this.szamlalo = 0;

        this.sandwich[this.steps[this.step].name] = [];
        this.sandwich[this.steps[this.step].name + "Price"] = 0;
        this.sandwich[this.steps[this.step].name + "Pic"] = [];

        this.updates.forEach((update) => {
            this.sandwich[this.steps[this.step].name][this.szamlalo] =
                update.querySelector(".list-name").innerHTML;
            this.sandwich[this.steps[this.step].name + "Price"] += parseInt(
                update.querySelector(".list-price").innerHTML
            );
            this.sandwich[this.steps[this.step].name + "Pic"][this.szamlalo] +=
                update.querySelector(".list-img").src.split("/").pop();

            this.szamlalo++;
        });

        this.sandwich.price = 0;
        for (let i = 0; i < this.steps.length; i++) {
            let caller = this.steps[i].name + "Price";
            if (this.sandwich[caller])
                this.sandwich.price += this.sandwich[caller];
        }

        this.previewUpdate(this.sandwich);

        console.log(this.sandwich);
    }

    /**
     *
     * @param {Object} sandwich
     */
    previewUpdate(sandwich) {
        this.previewPic = document.querySelector(".preview-pics");
        this.previewText = document.querySelector(".preview-text");

        this.previewText.innerHTML = `Előnézet: ${sandwich.price} Ft`;

        this.previewPic.innerHTML = "";

        for (let i in this.steps) {
            let caller = this.steps[i].name + "Pic";
            if (sandwich[caller]) {
                sandwich[caller].forEach((pic) => {
                    let source = pic.split("undefined").pop();
                    if (source != "noPic.png") {
                        let image = document.createElement("img");
                        image.classList.add("preview-img");
                        image.src = `./pics/${source}`;
                        this.previewPic.appendChild(image);
                    }
                });
            }
        }
    }
}
