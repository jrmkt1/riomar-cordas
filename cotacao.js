/* =============================================
   RIOMAR CORDAS – Sistema de Cotações
   cotacao.js
   ============================================= */

const CotacaoCart = (function () {
    const STORAGE_KEY = 'riomar_cotacao';

    // ── Persistência ──────────────────────────
    function getItems() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    }

    function saveItems(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        updateBadge();
    }

    function addItem(item) {
        const items = getItems();
        // tenta agrupar item igual (mesmo produto + bitola + cor + emb.)
        const key = item.produto + '|' + item.bitola + '|' + item.cor + '|' + item.embalagem;
        const idx = items.findIndex(i => (i.produto + '|' + i.bitola + '|' + i.cor + '|' + i.embalagem) === key);
        if (idx >= 0) {
            items[idx].qty = (items[idx].qty || 1) + (item.qty || 1);
        } else {
            item.id = Date.now() + Math.random();
            items.push(item);
        }
        saveItems(items);
        return items.length;
    }

    function removeItem(id) {
        saveItems(getItems().filter(i => i.id != id));
    }

    function updateQty(id, qty) {
        const items = getItems();
        const idx = items.findIndex(i => i.id == id);
        if (idx >= 0) {
            if (qty <= 0) { items.splice(idx, 1); }
            else { items[idx].qty = qty; }
        }
        saveItems(items);
    }

    function clear() { saveItems([]); }

    function count() { return getItems().reduce((s, i) => s + (i.qty || 1), 0); }

    // ── Badge flutuante ───────────────────────
    function updateBadge() {
        const badge = document.querySelector('.cotacao-fab__badge');
        if (!badge) return;
        const n = count();
        badge.textContent = n;
        badge.style.display = n > 0 ? 'flex' : 'none';
    }

    function injectFAB() {
        if (document.querySelector('.cotacao-fab')) return;
        const fab = document.createElement('div');
        fab.className = 'cotacao-fab';
        fab.id = 'cotacao-fab';
        fab.setAttribute('title', 'Ver Cotações');
        fab.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
      <span class="cotacao-fab__badge" style="display:none">0</span>
    `;
        fab.addEventListener('click', () => { window.location.href = 'cotacao.html'; });
        document.body.appendChild(fab);
        updateBadge();
    }

    // ── Widget nas páginas de produto ─────────
    function renderWidget(productData) {
        const container = document.getElementById('cotacao-widget');
        if (!container) return;

        const bitolas = (productData.bitolas || []);
        const cores = (productData.cores || []);

        const bitolaOpts = bitolas.length
            ? bitolas.map(b => `<option value="${b}">${b}</option>`).join('')
            : '<option value="">Consulte-nos</option>';

        const corOpts = cores.length
            ? cores.map(c => `<option value="${c}">${c}</option>`).join('')
            : '<option value="">Padrão</option>';

        container.innerHTML = `
      <div class="cot-widget">
        <h3 class="cot-widget__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
          Adicionar à Cotação
        </h3>

        <div class="cot-field">
          <label class="cot-label" for="cot-bitola">Bitola</label>
          <div class="cot-select-wrap">
            <select class="cot-select" id="cot-bitola">
              <option value="">Escolha uma opção</option>
              ${bitolaOpts}
            </select>
          </div>
        </div>

        <div class="cot-field">
          <label class="cot-label" for="cot-cor">Cor</label>
          <div class="cot-select-wrap">
            <select class="cot-select" id="cot-cor">
              <option value="">Escolha uma opção</option>
              ${corOpts}
            </select>
          </div>
        </div>

        <div class="cot-field">
          <label class="cot-label">Quantidade (rolos/unidades)</label>
          <div class="cot-qty">
            <button class="cot-qty__btn" id="cot-minus" aria-label="Diminuir">−</button>
            <input class="cot-qty__input" type="number" id="cot-qty" value="1" min="1" max="9999" aria-label="Quantidade"/>
            <button class="cot-qty__btn" id="cot-plus" aria-label="Aumentar">+</button>
          </div>
        </div>

        <div class="cot-field">
          <label class="cot-label" for="cot-obs">Observações <span style="font-weight:400;opacity:.7">(opcional)</span></label>
          <textarea class="cot-textarea" id="cot-obs" rows="2" placeholder="Ex: metragem específica, cor alternativa…"></textarea>
        </div>

        <button class="cot-btn" id="cot-add-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar às Cotações
        </button>

        <div class="cot-toast" id="cot-toast" role="alert" aria-live="polite"></div>

        <div class="cot-meta">
          <span>Categoria: ${productData.categoria || '—'}</span>
          <span>·</span>
          <span>SKU: ${productData.sku || '—'}</span>
        </div>
      </div>
    `;

        // ── Eventos ────────────────────────────
        const qtyInput = document.getElementById('cot-qty');

        document.getElementById('cot-minus').addEventListener('click', () => {
            const v = parseInt(qtyInput.value) || 1;
            if (v > 1) qtyInput.value = v - 1;
        });
        document.getElementById('cot-plus').addEventListener('click', () => {
            const v = parseInt(qtyInput.value) || 1;
            qtyInput.value = v + 1;
        });

        document.getElementById('cot-add-btn').addEventListener('click', () => {
            const bitola = document.getElementById('cot-bitola').value;
            const cor = document.getElementById('cot-cor').value;
            const qty = parseInt(qtyInput.value) || 1;
            const obs = document.getElementById('cot-obs').value.trim();

            if (productData.bitolas && productData.bitolas.length > 0 && !bitola) {
                showToast('Selecione uma bitola antes de adicionar.', 'error'); return;
            }
            if (productData.cores && productData.cores.length > 1 && !cor) {
                showToast('Selecione uma cor antes de adicionar.', 'error'); return;
            }

            const total = addItem({
                produto: productData.nome,
                bitola: bitola || '—',
                cor: cor || (productData.cores[0] || '—'),
                embalagem: productData.embalagem || '—',
                qty,
                obs,
            });

            showToast(`✔ Adicionado! Sua cotação tem ${total} item(s). <a href="cotacao.html">Ver cotação →</a>`, 'success');

            // reset qty
            qtyInput.value = 1;
        });
    }

    function showToast(msg, type) {
        const el = document.getElementById('cot-toast');
        if (!el) return;
        el.innerHTML = msg;
        el.className = 'cot-toast cot-toast--' + type + ' cot-toast--show';
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove('cot-toast--show'), 4500);
    }

    // ── API pública ───────────────────────────
    return { getItems, addItem, removeItem, updateQty, clear, count, injectFAB, renderWidget, updateBadge };
})();

// Auto-inicializa FAB em todas as páginas assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    CotacaoCart.injectFAB();
});
