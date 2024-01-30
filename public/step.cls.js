class Step {
    static template = ``;
    constructor(renderTo, nextBtn, prevBtn) {
        this.data;
        this.content = document.querySelector(renderTo);
        this.nextBtn = document.querySelector(nextBtn);
        this.prevBtn = document.querySelector(prevBtn);

        renderTo.innerHTML = Step.template;
    }
}

class Kenyer extends Step {}

class Szosz extends Step {}

class Feltet extends Step {}
