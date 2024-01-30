class Wizard {
    static template = `
        <h2>Üdvözlünk a SzendóMágus egyedi szendvicsrendelő appjában!</h2>
        <p>A folytatáshoz kattints a tovább gombra.</p>`;

    constructor(renderTo, nextBtn, prevBtn) {
        this.content = document.querySelector(renderTo);
        this.content.innerHTML = Wizard.template;

        this.step = 0;

        console.log("Wizard");
        document.querySelector(nextBtn).addEventListener("click", () => {});
    }

    next() {
        this.step++;
    }
}
