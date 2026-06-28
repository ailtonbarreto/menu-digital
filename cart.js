document.addEventListener('DOMContentLoaded', () => {

  const cartPopup = document.getElementById('cart_popup');
  const cartIcon = document.getElementById('cart');
  const cartCount = document.getElementById('cartCount');

  /* =======================
     STORAGE
  ======================= */
  function getCarrinho() {
    return JSON.parse(sessionStorage.getItem('carrinho')) || [];
  }

  function salvarCarrinho(carrinho) {
    sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
  }

  /* =======================
     POPUP CARRINHO
  ======================= */
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

      html += `<p style="color:#fff;text-align:center">Nenhum item</p>`;

    } else {

      let total = 0;

      carrinho.forEach(item => {

        const preco = Number(
          item.preco.toString().replace('R$', '').replace('.', '').replace(',', '.')
        );

        const subtotal = preco * item.qtd;
        total += subtotal;

        html += `
          <div class="cart-card">

            <div class="cart-info">

              <small class="cart-categoria">${item.categoria}</small>

              <div class="nome_item">

                
                <strong>${item.nome}</strong>
                <span>R$ ${item.preco}</span>

              </div>


              <div class="cart-qtd">
                <button onclick="alterarQtd('${item.id}', -1)">−</button>
                <span>${item.qtd}</span>
                <button onclick="alterarQtd('${item.id}', 1)">+</button>
              </div>

              <textarea
                placeholder="Observação deste item"
                oninput="salvarObsItem('${item.id}', this.value)"
              >${item.obs || ''}</textarea>
            </div>
            

            <span class="material-symbols-outlined"
              onclick="removerItem('${item.id}')">delete</span>
          </div>
        `;
      });

      html += `
        <div class="cart-footer">
          <strong>Total: R$ ${total.toFixed(2)}</strong>
          <button class="finalizar-btn" onclick="abrirModalEndereco()">
            Concluir
          </button>
        </div>
      `;
    }

    html += `</div>`;
    cartPopup.innerHTML = html;

    atualizarContador();
  }

  /* =======================
     AÇÕES
  ======================= */
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
  };

  window.fecharCarrinho = fecharCarrinho;

  /* =======================
     CONTADOR
  ======================= */
  function atualizarContador() {
    const total = getCarrinho().reduce((s, i) => s + i.qtd, 0);
    cartCount.textContent = total;
    cartCount.style.display = total > 0 ? 'inline-flex' : 'none';
  }

  atualizarContador();
  window.abrirModalEndereco = function () {

    if (document.getElementById('modalEndereco')) return;

    const modal = document.createElement('div');
    modal.id = 'modalEndereco';
    modal.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,.6);
      display:flex; align-items:center; justify-content:center; z-index:9999;
    `;

    modal.innerHTML = `
      <div id='finish_container'>
      

          <h3 style='with: 90%; text-align: center; color: #FFF'>Dados do Pedido</h3>
          

          <div>

            <input id="clienteNome" placeholder="Nome">

          </div>

          <div class='endereco_container'>

              <div>

                <input id="rua" placeholder="Rua" >

              </div>

              <div class='numero_container'>

                <input id="numero" placeholder="Número">
                <input id="complemento" placeholder="Complemento">

              </div>

          
            
            <input id="bairro" placeholder="Bairro">

          </div>

        <div class='send_zap_container'>

          <button onclick="enviarPedido()" id='send_zap_btn'>Enviar WhatsApp</button>
          <button onclick="fecharModalEndereco()" id='cancel_zap_btn'>Cancelar</button>

        </div>


      </div>
    `;

    document.body.appendChild(modal);
  };

  window.fecharModalEndereco = function () {
    document.getElementById('modalEndereco').remove();
  };

  /* =======================
     WHATSAPP
  ======================= */
  window.enviarPedido = function () {

    const nome = document.getElementById('clienteNome').value.trim();
    const rua = document.getElementById('rua').value.trim();
    const numero = document.getElementById('numero').value.trim();
    const complemento = document.getElementById('complemento').value.trim();
    const bairro = document.getElementById('bairro').value.trim();

    if (!nome || !rua || !numero || !bairro) {
      alert('Preencha Nome, Rua, Número e Bairro');
      return;
    }

    const carrinho = getCarrinho();

    let mensagem = `NOVO PEDIDO\n\n`;
    mensagem += `Cliente: ${nome}\n\n`;

    mensagem += `ENDEREÇO\n\n`;
    mensagem += `Rua: ${rua}\n`;
    mensagem += `Número: ${numero}\n`;
    mensagem += `Complemento: ${complemento || '—'}\n`;
    mensagem += `Bairro: ${bairro}\n\n`;

    let total = 0;
    mensagem += `Itens:\n`;

    carrinho.forEach(item => {
      const preco = item.preco.replace('R$', '').replace('.', '').replace(',', '.');
      const subtotal = preco * item.qtd;
      total += subtotal;


      mensagem += `• ${item.qtd}x ${item.nome} — R$ ${subtotal.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}\n`;


      if (item.obs) mensagem += `Obs: ${item.obs}\n`;
    });

    mensagem += `\nTotal: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;



    const telefone = '5516994632838';
    window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`, '_blank');

    sessionStorage.removeItem('carrinho');
    atualizarContador();
    fecharModalEndereco();
    fecharCarrinho();
  };

});
