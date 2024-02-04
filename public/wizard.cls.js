class Wizard {
    static template = `
        <h2 class="window-text">Üdvözlünk a SzendóMágus egyedi szendvicsrendelő appjában!</h2>
        <p class="window-fill">A folytatáshoz kattints a tovább gombra.</p>`;

    static preview = `
        <div class="preview-text"></div>
        <div class="preview-pics"></div>
        `;

    constructor(renderTo, nextBtn, prevBtn) {
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

        this.sandwich = {
            price: 0,
        };

        fetch("/lepesek")
            .then((res) => res.json())
            .then((lepesek) => {
                this.steps = lepesek;
                console.log(this.steps);
            });

        this.step = -1;

        document.querySelector(nextBtn).addEventListener("click", () => {
            this.next();
        });

        document.querySelector(prevBtn).addEventListener("click", () => {
            this.previous();
        });
    }

    next() {
        let valid = this.validate();
        if (valid) {
            if (this.step > -1) this.sandwichUpdate(".activated");

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
                    <input type="text" id="order-name" />
                `;
                this.list.innerHTML = "";
            } else {
                this.content.innerHTML = ``;
            }
        }
    }

    previous() {
        this.step--;
        this.step--;
        this.next();
    }

    validate() {
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
     */
    sandwichUpdate(selector) {
        this.updates = document.querySelectorAll(selector);

        console.log(this.updates);

        this.szamlalo = 0;

        this.sandwich[this.steps[this.step].name] = [];
        this.sandwich[this.steps[this.step].name + "Price"] = 0;

        this.updates.forEach((update) => {
            this.sandwich[this.steps[this.step].name][this.szamlalo] =
                update.querySelector(".list-name").innerHTML;
            this.sandwich[this.steps[this.step].name + "Price"] += parseInt(
                update.querySelector(".list-price").innerHTML
            );

            this.szamlalo++;
        });

        console.log(this.sandwich);
    }
}
