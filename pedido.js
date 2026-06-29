document.addEventListener('DOMContentLoaded', () => {

    const cartPopup = document.getElementById('cart_popup');
    const cartIcon = document.getElementById('cart');
    const cartCount = document.getElementById('cartCount');

    /* ===========================
       STORAGE
    =========================== */

    function getCarrinho() {
        return JSON.parse(sessionStorage.getItem('carrinho')) || [];
    }

    function salvarCarrinho(carrinho) {
        sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
    }

    /* ===========================
       POPUP
    =========================== */

    cartIcon.addEventListener('click', abrirCarrinho);

    function abrirCarrinho() {
        cartPopup.style.display = 'flex';
        renderCarrinho();
    }

    function fecharCarrinho() {
        cartPopup.style.display = 'none';
    }

    cartPopup.addEventListener('click', e => {
        if (e.target === cartPopup) fecharCarrinho();
    });

    /* ===========================
       RENDER
    =========================== */

    function renderCarrinho() {

        const carrinho = getCarrinho();

        let html = `
        <div class="cart-box">

            <div class="cart-header">
                <h3>Pedido</h3>
                <button class="cart-close" onclick="fecharCarrinho()">✕</button>
            </div>
    `;

        if (carrinho.length === 0) {

            html += `
            <p style="color:#FFF;text-align:center">
                Nenhum item
            </p>
        `;

        } else {

            let total = 0;

            carrinho.forEach(item => {

                const preco = Number(
                    item.preco
                        .toString()
                        .replace("R$", "")
                        .replace(".", "")
                        .replace(",", ".")
                );

                const subtotal = preco * item.qtd;
                total += subtotal;

                html += `

                <div class="cart-card">

                    <div class="cart-info">

                        <small class="cart-categoria">
                            ${item.categoria}
                        </small>

                        <div class="nome_item">

                            <strong>${item.nome}</strong>

                            <span>
                                R$ ${item.preco}
                            </span>

                        </div>

                        <div class="cart-qtd">

                            <button onclick="alterarQtd('${item.id}',-1)">
                                −
                            </button>

                            <span>${item.qtd}</span>

                            <button onclick="alterarQtd('${item.id}',1)">
                                +
                            </button>

                        </div>

                        <textarea
                            placeholder="Observação deste item"
                            oninput="salvarObsItem('${item.id}',this.value)"
                        >${item.obs || ""}</textarea>

                    </div>

                    <span
                        class="material-symbols-outlined"
                        onclick="removerItem('${item.id}')"
                    >
                        delete
                    </span>

                </div>

            `;

            });

            html += `

            <div class="cart-footer">

                <strong>
                    Total: R$ ${total.toFixed(2)}
                </strong>

                <button
                    class="finalizar-btn"
                    onclick="abrirModalEndereco()"
                >
                    Concluir
                </button>

            </div>

        `;
        }

        html += "</div>";

        cartPopup.innerHTML = html;

        atualizarContador();

    };

    /* ===========================
       AÇÕES
    =========================== */

    window.alterarQtd = function (id, delta) {

        const carrinho = getCarrinho();

        const item = carrinho.find(i => i.id === id);

        if (!item) return;

        item.qtd += delta;

        if (item.qtd <= 0) {

            removerItem(id);

            return;

        }

        salvarCarrinho(carrinho);

        renderCarrinho();

    };

    window.removerItem = function (id) {

        const carrinho = getCarrinho().filter(i => i.id !== id);

        salvarCarrinho(carrinho);

        renderCarrinho();

    };

    window.salvarObsItem = function (id, texto) {

        const carrinho = getCarrinho();

        const item = carrinho.find(i => i.id === id);

        if (!item) return;

        item.obs = texto;

        salvarCarrinho(carrinho);

    }

    window.fecharCarrinho = fecharCarrinho;

    /* ===========================
       CONTADOR
    =========================== */

    function atualizarContador() {

        const total = getCarrinho()
            .reduce((s, i) => s + i.qtd, 0);

        cartCount.textContent = total;

        cartCount.style.display =
            total > 0
                ? "inline-flex"
                : "none";

    }

    atualizarContador();

    /* ===========================
       MODAL DADOS DO CLIENTE
    =========================== */

    window.abrirModalEndereco = function () {

        if (document.getElementById("modalEndereco")) return;

        const modal = document.createElement("div");

        modal.id = "modalEndereco";

        modal.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.6);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:9999;
    `;

        modal.innerHTML = `

            <div id="finish_container">

                <h3>
                    Número da Mesa
                </h3>

                <div>

                    <select id="mesa" style="width:100%;padding:12px;">

                        <option value="">Selecione a mesa</option>

                        <option value="Mesa 01">Mesa 01</option>
                        <option value="Mesa 02">Mesa 02</option>
                        <option value="Mesa 03">Mesa 03</option>
                        <option value="Mesa 04">Mesa 04</option>
                        <option value="Mesa 05">Mesa 05</option>
                        <option value="Mesa 06">Mesa 06</option>
                        <option value="Mesa 07">Mesa 07</option>
                        <option value="Mesa 08">Mesa 08</option>
                        <option value="Mesa 09">Mesa 09</option>
                        <option value="Mesa 10">Mesa 10</option>

                    </select>

                </div>

                <div class="send_zap_container">

                    <button
                        id="send_zap_btn"
                        onclick="gerarPDF()"
                    >
                        📄 Gerar Pedido
                    </button>

                    <button
                        id="cancel_zap_btn"
                        onclick="fecharModalEndereco()"
                    >
                        Cancelar
                    </button>

                </div>

            </div>

        `;

        document.body.appendChild(modal);

    };

    window.fecharModalEndereco = function () {

        const modal = document.getElementById("modalEndereco");

        if (modal) {

            modal.remove();

        }

    };

    /* ===========================
       GERAR PDF
    =========================== */

    window.gerarPDF = function () {

        const mesa = document.getElementById("mesa").value;

        if (!mesa) {
            alert("Selecione a mesa.");
            return;
        }

        const carrinho = getCarrinho();

        if (carrinho.length === 0) {
            alert("O carrinho está vazio.");
            return;
        }

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF();

        let y = 20;

        // Cabeçalho
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("PEDIDO", 105, y, { align: "center" });

        y += 15;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(mesa, 105, y, { align: "center" });

        y += 12;
        y += 7;

        y += 12;

        doc.setDrawColor(180);
        doc.line(10, y, 200, y);

        y += 10;

        doc.setFont("helvetica", "bold");
        doc.text("Itens do Pedido", 10, y);

        y += 8;

        doc.setFont("helvetica", "normal");

        let total = 0;

        carrinho.forEach(item => {

            const preco = Number(
                item.preco
                    .toString()
                    .replace("R$", "")
                    .replace(".", "")
                    .replace(",", ".")
            );

            const subtotal = preco * item.qtd;

            total += subtotal;

            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.text(`${item.qtd}x ${item.nome} `, 10, y);

            doc.text(
                `R$ ${subtotal.toFixed(2).replace(".", ",")} `,
                190,
                y,
                { align: "right" }
            );

            y += 6;

            doc.setFont("helvetica", "normal");

            doc.text(`Categoria: ${item.categoria} `, 15, y);

            y += 5;

            if (item.obs && item.obs.trim() !== "") {

                doc.setFontSize(9);

                doc.text(`Obs: ${item.obs} `, 20, y);

                doc.setFontSize(11);

                y += 5;
            }

            y += 4;

        });

        doc.setDrawColor(180);

        doc.line(10, y, 200, y);

        y += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);

        doc.text(
            `TOTAL: R$ ${total.toFixed(2).replace(".", ",")} `,
            190,
            y,
            { align: "right" }
        );

        y += 15;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        doc.text(
            `Pedido gerado em ${new Date().toLocaleString("pt-BR")} `,
            105,
            y,
            { align: "center" }
        );

        const arquivo =
            `Pedido_${mesa.replace(/\s+/g, "_")}_${Date.now()}.pdf`;

        doc.save(arquivo);

        sessionStorage.removeItem("carrinho");

        atualizarContador();

        renderCarrinho();

        fecharModalEndereco();

        fecharCarrinho();

    };

});