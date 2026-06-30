document.addEventListener('DOMContentLoaded', () => {

    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkg9SvDGS7hBQa3qjo4oQ5ntxdSytu5CbAtKYKtou4mUxwCIVLWgifuBWKU745JUv7Mzr4iVSGQ2pB/pub?gid=0&single=true&output=csv';

    const sidebar = document.getElementById('sidebar');
    const cards = document.getElementById('cards');
    const btnAbrir = document.getElementById('btnAbrir');
    const btnFechar = document.getElementById('btnFechar');
    const menuCategorias = document.getElementById('menuCategorias');
    const cartCount = document.getElementById('cartCount');
    const title = document.getElementById('categoria_title');

    let dadosPorCategoria = {};

    function atualizarContadorCarrinho() {
        const carrinho = getCarrinho();

        const total = carrinho.reduce((soma, item) => {
            return soma + item.qtd;
        }, 0);

        cartCount.textContent = total;
        cartCount.style.display = total > 0 ? 'flex' : 'none';
    }

    function getCarrinho() {
        return JSON.parse(sessionStorage.getItem('carrinho')) || [];
    }

    function salvarCarrinho(carrinho) {
        sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
    }

    function adicionarAoCarrinho(item) {
        const carrinho = getCarrinho();

        const index = carrinho.findIndex(p => p.id === item.id);

        if (index > -1) {
            carrinho[index].qtd += 1;
        } else {
            carrinho.push({
                ...item,
                qtd: 1
            });
        }

        salvarCarrinho(carrinho);
        atualizarContadorCarrinho();
    }

    btnAbrir.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    btnFechar.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    function carregarCardapio() {

        Papa.parse(url, {
            download: true,
            header: true,
            skipEmptyLines: true,

            transformHeader: h =>
                h.normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '')
                    .replace(/\r/g, '')
                    .toLowerCase(),

            complete: res => {

                dadosPorCategoria = {};

                res.data.forEach(item => {

                    if (!item.status || item.status.toLowerCase() !== 'ativo') return;

                    const categoria = item.categoria || 'Outros';

                    if (!dadosPorCategoria[categoria]) {
                        dadosPorCategoria[categoria] = [];
                    }

                    dadosPorCategoria[categoria].push(item);

                });

                montarMenu();

            },

            error: err => console.error('Erro CSV:', err)

        });

    }

    function montarMenu() {

        menuCategorias.innerHTML = '';

        Object.keys(dadosPorCategoria).forEach((cat, index) => {

            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.textContent = cat;

            btn.addEventListener('click', () => {

                carregarCategoria(cat);
                sidebar.classList.remove('open');

            });

            menuCategorias.appendChild(btn);

            // Carrega automaticamente a primeira categoria
            if (index === 0) {
                carregarCategoria(cat);
            }

        });

    }

    function carregarCategoria(categoria) {

        // Atualiza o título da categoria
        title.textContent = categoria;

        // Limpa os cards atuais
        cards.innerHTML = '';

        dadosPorCategoria[categoria].forEach(item => {

            const itemId = `${categoria}-${item.nome}`
                .replace(/\s+/g, '_')
                .toLowerCase();

            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `

                    <div class="title">
                        <h3>${item.nome}</h3>
                        <strong>R$ ${item.preco}</strong>
                    </div>

                ${item.imagem ? `
                    <div class="card-img">
                        <img src="${item.imagem}" alt="${item.nome}" loading="lazy">
                    </div>
                ` : ''}

                <div class="card-info">



                    <p>${item.descricao || ''}</p>

                    <div class="price">
                        <button class="cta-btn">Adicionar</button>
                    </div>

                </div>
            `;

            card.querySelector('.cta-btn').addEventListener('click', () => {

                adicionarAoCarrinho({
                    id: itemId,
                    nome: item.nome,
                    preco: item.preco,
                    // imagem: item.imagem || '',
                    categoria
                });

            });

            cards.appendChild(card);

        });

    }

    carregarCardapio();
    atualizarContadorCarrinho();

});