/* ========================================
   HEMOBANCO - JavaScript Principal
   (versão página única - sem redirecionamento)
   ======================================== */

const storage = {
    getDoadores: () => JSON.parse(localStorage.getItem('hemobanco_doadores') || '[]'),
    setDoadores: (data) => localStorage.setItem('hemobanco_doadores', JSON.stringify(data)),
    getDoacoes: () => JSON.parse(localStorage.getItem('hemobanco_doacoes') || '[]'),
    setDoacoes: (data) => localStorage.setItem('hemobanco_doacoes', JSON.stringify(data)),
    getBloqueados: () => JSON.parse(localStorage.getItem('hemobanco_bloqueados') || '[]'),
    setBloqueados: (data) => localStorage.setItem('hemobanco_bloqueados', JSON.stringify(data)),
    getUser: () => JSON.parse(localStorage.getItem('hemobanco_user') || 'null'),
    setUser: (user) => localStorage.setItem('hemobanco_user', JSON.stringify(user)),
    clearUser: () => localStorage.removeItem('hemobanco_user')
};

function initMockData() {
    if (!localStorage.getItem('hemobanco_bloqueados')) {
        const bloqueados = [
            {
                cpf: '456.789.123-44',
                nome: 'Rodrigo Almeida Pires',
                motivo: 'Tatuagem recente realizada há menos de 12 meses',
                periodo: '12 meses (Até 15/02/2025)',
                hemocentro: 'Fundação Pró-Sangue - Posto Clínicas'
            },
            {
                cpf: '789.123.456-55',
                nome: 'Juliana Ferreira Lima',
                motivo: 'Tratamento com medicação contraindicada (Isotretinoína)',
                periodo: '6 meses (Até 01/09/2024)',
                hemocentro: 'Hemocentro Regional de Osasco'
            },
            {
                cpf: '321.654.987-22',
                nome: 'Lucas Mendes de Souza',
                motivo: 'Viagem recente para área endêmica de malária',
                periodo: '12 meses (Até 10/04/2025)',
                hemocentro: 'Banco de Sangue de Guarulhos'
            }
        ];
        storage.setBloqueados(bloqueados);
    }
    if (!localStorage.getItem('hemobanco_doadores')) {
        storage.setDoadores([]);
    }
    if (!localStorage.getItem('hemobanco_doacoes')) {
        storage.setDoacoes([]);
    }
}

/* ========== MOSTRAR / ESCONDER TELAS ========== */
function mostrarLogin() {
    document.getElementById('tela-login').classList.remove('hidden');
    document.getElementById('tela-app').classList.add('hidden');
    document.body.classList.add('login-page');
    document.body.classList.remove('app-page');
}

function mostrarApp() {
    document.getElementById('tela-login').classList.add('hidden');
    document.getElementById('tela-app').classList.remove('hidden');
    document.body.classList.remove('login-page');
    document.body.classList.add('app-page');
}

/* ========== LOGIN ========== */
function initLogin() {
    const tabs = document.querySelectorAll('.login-tab');
    const forms = document.querySelectorAll('.login-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.form).classList.add('active');
        });
    });

    // Login Empresa
    const formEmpresa = document.getElementById('form-empresa');
    if (formEmpresa) {
        formEmpresa.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('empresa-email').value.trim();
            const senha = document.getElementById('empresa-senha').value.trim();

            if (email && senha) {
                storage.setUser({
                    tipo: 'empresa',
                    nome: 'Operador CEO',
                    email: email
                });
                entrarNoSistema();
            } else {
                showAlert('login-alert', 'Preencha todos os campos.', 'error');
            }
        });
    }

    // Login Doador
    const formDoador = document.getElementById('form-doador');
    if (formDoador) {
        formDoador.addEventListener('submit', (e) => {
            e.preventDefault();
            const cpf = document.getElementById('doador-cpf').value.trim();
            const senha = document.getElementById('doador-senha').value.trim();

            if (cpf && senha) {
                storage.setUser({
                    tipo: 'doador',
                    nome: 'Colaborador RMSP',
                    cpf: cpf
                });
                entrarNoSistema();
            } else {
                showAlert('login-alert', 'Preencha todos os campos.', 'error');
            }
        });
    }
}

function entrarNoSistema() {
    const user = storage.getUser();
    if (!user) return;

    // Atualiza dados do usuário na sidebar
    const userName = document.getElementById('user-name');
    const userType = document.getElementById('user-type');
    const avatar = document.getElementById('user-avatar');

    if (userName) userName.textContent = user.nome || 'Usuário';
    if (userType) userType.textContent = user.tipo === 'empresa' ? 'Empresa / Hemocentro' : 'Doador';
    if (avatar) avatar.textContent = (user.nome || 'U').charAt(0).toUpperCase();

    // Inicializa as telas internas
    initNavegacao();
    initCadastroDoador();
    initCadastroDoacao();
    initBloqueados();
    initDeclaracoes();
    renderNotificacoes();
    navigateTo('painel');

    // Mostra o app e esconde o login
    mostrarApp();
}

/* ========== NAVEGAÇÃO INTERNA ========== */
function initNavegacao() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });

    document.querySelectorAll('.card[data-page]').forEach(card => {
        card.addEventListener('click', () => {
            const page = card.dataset.page;
            navigateTo(page);
            navItems.forEach(n => {
                n.classList.toggle('active', n.dataset.page === page);
            });
        });
    });

    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            storage.clearUser();
            // Limpa formulários de login
            const formEmp = document.getElementById('form-empresa');
            const formDoa = document.getElementById('form-doador');
            if (formEmp) formEmp.reset();
            if (formDoa) formDoa.reset();
            mostrarLogin();
        });
    }
}

function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    const section = document.getElementById('page-' + page);
    if (section) section.classList.remove('hidden');
}

/* ========== CADASTRO DE DOADORES ========== */
function initCadastroDoador() {
    const form = document.getElementById('form-cadastro-doador');
    if (!form) return;

    // Evita adicionar listener duplicado
    if (form.dataset.ready) return;
    form.dataset.ready = '1';

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const doador = {
            cpf: document.getElementById('doador-cpf-cad').value.trim(),
            rg: document.getElementById('doador-rg').value.trim(),
            nome: document.getElementById('doador-nome').value.trim(),
            endereco: document.getElementById('doador-endereco').value.trim(),
            municipio: document.getElementById('doador-municipio').value,
            telefone: document.getElementById('doador-telefone').value.trim(),
            recado: document.getElementById('doador-recado').value.trim(),
            email: document.getElementById('doador-email').value.trim(),
            tipoSanguineo: document.getElementById('doador-tipo').value,
            fatorRH: document.getElementById('doador-rh').value,
            dataCadastro: new Date().toLocaleDateString('pt-BR')
        };

        if (!doador.cpf || !doador.nome || !doador.tipoSanguineo || !doador.fatorRH) {
            showAlert('alert-doador', 'Preencha os campos obrigatórios (CPF, Nome, Tipo Sanguíneo e Fator RH).', 'error');
            return;
        }

        const doadores = storage.getDoadores();
        if (doadores.some(d => d.cpf === doador.cpf)) {
            showAlert('alert-doador', 'Já existe um doador cadastrado com este CPF.', 'error');
            return;
        }

        doadores.push(doador);
        storage.setDoadores(doadores);
        form.reset();
        showAlert('alert-doador', 'Doador cadastrado com sucesso!', 'success');
    });
}

/* ========== CADASTRO DE DOAÇÃO ========== */
function initCadastroDoacao() {
    const form = document.getElementById('form-cadastro-doacao');
    if (!form) return;
    if (form.dataset.ready) return;
    form.dataset.ready = '1';

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const doacao = {
            cpf: document.getElementById('doacao-cpf').value.trim(),
            nome: document.getElementById('doacao-nome').value.trim(),
            data: document.getElementById('doacao-data').value,
            tipo: document.getElementById('doacao-tipo').value,
            volume: document.getElementById('doacao-volume').value,
            hemocentro: document.getElementById('doacao-hemocentro').value,
            observacoes: document.getElementById('doacao-obs').value.trim()
        };

        if (!doacao.cpf || !doacao.data || !doacao.tipo) {
            showAlert('alert-doacao', 'Preencha os campos obrigatórios.', 'error');
            return;
        }

        const bloqueados = storage.getBloqueados();
        const bloqueado = bloqueados.find(b => b.cpf.replace(/\D/g, '') === doacao.cpf.replace(/\D/g, ''));
        if (bloqueado) {
            showAlert('alert-doacao', `Doador bloqueado: ${bloqueado.motivo}. Período: ${bloqueado.periodo}`, 'error');
            return;
        }

        const doacoes = storage.getDoacoes();
        doacoes.push(doacao);
        storage.setDoacoes(doacoes);
        form.reset();
        showAlert('alert-doacao', 'Doação registrada com sucesso!', 'success');
        renderUltimasDoacoes();
    });

    renderUltimasDoacoes();
}

function renderUltimasDoacoes() {
    const tbody = document.getElementById('tbody-doacoes');
    if (!tbody) return;

    const doacoes = storage.getDoacoes().slice(-10).reverse();
    if (doacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma doação registrada ainda.</td></tr>';
        return;
    }

    tbody.innerHTML = doacoes.map(d => `
        <tr>
            <td>${d.cpf}</td>
            <td>${d.nome || '-'}</td>
            <td>${formatDate(d.data)}</td>
            <td>${d.tipo}</td>
            <td>${d.hemocentro || '-'}</td>
        </tr>
    `).join('');
}

/* ========== DOADORES BLOQUEADOS ========== */
function initBloqueados() {
    const formBusca = document.getElementById('form-busca-bloqueado');
    if (formBusca && !formBusca.dataset.ready) {
        formBusca.dataset.ready = '1';
        formBusca.addEventListener('submit', (e) => {
            e.preventDefault();
            filtrarBloqueados();
        });
    }

    const btnLimpar = document.getElementById('btn-limpar-bloqueados');
    if (btnLimpar && !btnLimpar.dataset.ready) {
        btnLimpar.dataset.ready = '1';
        btnLimpar.addEventListener('click', () => {
            document.getElementById('form-busca-bloqueado').reset();
            renderBloqueados(storage.getBloqueados());
        });
    }

    const formAdd = document.getElementById('form-add-bloqueado');
    if (formAdd && !formAdd.dataset.ready) {
        formAdd.dataset.ready = '1';
        // data padrão = hoje
        const dataInput = document.getElementById('add-data-bloqueio');
        if (dataInput && !dataInput.value) {
            dataInput.value = new Date().toISOString().slice(0, 10);
        }
        formAdd.addEventListener('submit', (e) => {
            e.preventDefault();
            adicionarBloqueado();
        });
    }

    renderBloqueados(storage.getBloqueados());
}

function adicionarBloqueado() {
    const cpf = document.getElementById('add-cpf').value.trim();
    const rg = document.getElementById('add-rg').value.trim();
    const nome = document.getElementById('add-nome').value.trim();
    const motivo = document.getElementById('add-motivo').value.trim();
    const dataBloqueio = document.getElementById('add-data-bloqueio').value;
    const periodo = document.getElementById('add-periodo').value;
    const ultimaDoacao = document.getElementById('add-ultima-doacao').value;
    const hemocentro = document.getElementById('add-hemocentro').value;

    if (!cpf || !nome || !motivo || !dataBloqueio || !periodo) {
        showAlert('alert-bloqueado', 'Preencha CPF, nome, motivo, data e período do bloqueio.', 'error');
        return;
    }

    const lista = storage.getBloqueados();
    const cpfDigits = cpf.replace(/\D/g, '');
    if (lista.some(b => b.cpf.replace(/\D/g, '') === cpfDigits)) {
        showAlert('alert-bloqueado', 'Já existe um bloqueio para este CPF.', 'error');
        return;
    }

    lista.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        cpf,
        rg,
        nome,
        motivo,
        dataBloqueio,
        periodo,
        ultimaDoacao,
        hemocentro
    });
    storage.setBloqueados(lista);

    document.getElementById('form-add-bloqueado').reset();
    const dataInput = document.getElementById('add-data-bloqueio');
    if (dataInput) dataInput.value = new Date().toISOString().slice(0, 10);
    document.getElementById('add-periodo').value = '12 meses';

    showAlert('alert-bloqueado', 'Doador adicionado à lista de bloqueados.', 'success');
    renderBloqueados(lista);
}

function removerBloqueado(id) {
    let lista = storage.getBloqueados();
    lista = lista.filter(b => b.id !== id);
    // também remove itens antigos sem id comparando por referência em string
    storage.setBloqueados(lista);
    renderBloqueados(lista);
    showAlert('alert-bloqueado', 'Bloqueio removido.', 'success');
}

function filtrarBloqueados() {
    const cpf = document.getElementById('busca-cpf').value.trim().replace(/\D/g, '');
    const nome = document.getElementById('busca-nome').value.trim().toLowerCase();
    const motivo = document.getElementById('busca-motivo').value.trim().toLowerCase();

    let lista = storage.getBloqueados();

    if (cpf) lista = lista.filter(b => b.cpf.replace(/\D/g, '').includes(cpf));
    if (nome) lista = lista.filter(b => b.nome.toLowerCase().includes(nome));
    if (motivo) lista = lista.filter(b => b.motivo.toLowerCase().includes(motivo));

    renderBloqueados(lista);
}

function renderBloqueados(lista) {
    const tbody = document.getElementById('tbody-bloqueados');
    if (!tbody) return;

    // garante id em registros antigos (seed)
    let changed = false;
    const all = storage.getBloqueados().map(b => {
        if (!b.id) {
            b.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
            changed = true;
        }
        return b;
    });
    if (changed) storage.setBloqueados(all);

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum doador bloqueado encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(b => {
        const id = b.id || '';
        const periodoExtra = b.dataBloqueio
            ? `<br><small style="color:#888">desde ${formatDate(b.dataBloqueio)}</small>`
            : '';
        return `
        <tr>
            <td>${b.cpf}</td>
            <td>${b.nome}</td>
            <td><span class="badge-motivo">${b.motivo}</span></td>
            <td>${b.periodo}${periodoExtra}</td>
            <td>${b.hemocentro || '-'}</td>
            <td>
                <button type="button" class="btn-remover" title="Remover bloqueio"
                    onclick="removerBloqueado('${id}')">
                    <span class="i i-block"></span>
                </button>
            </td>
        </tr>`;
    }).join('');
}

/* ========== GERAR DECLARAÇÕES ========== */
function initDeclaracoes() {
    const form = document.getElementById('form-declaracao');
    if (!form) return;
    if (form.dataset.ready) return;
    form.dataset.ready = '1';

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const cpf = document.getElementById('decl-cpf').value.trim();
        const nome = document.getElementById('decl-nome').value.trim();
        const data = document.getElementById('decl-data').value;
        const tipo = document.getElementById('decl-tipo').value;

        if (!cpf || !nome || !data) {
            showAlert('alert-declaracao', 'Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        document.getElementById('preview-nome').textContent = nome;
        document.getElementById('preview-cpf').textContent = cpf;
        document.getElementById('preview-data').textContent = formatDate(data);
        document.getElementById('preview-tipo').textContent = tipo || 'Sangue total';
        document.getElementById('preview-emissao').textContent = new Date().toLocaleDateString('pt-BR');
        document.getElementById('declaracao-preview').classList.remove('hidden');
        showAlert('alert-declaracao', 'Declaração gerada com sucesso! Você pode imprimir.', 'success');
    });

    const btnImprimir = document.getElementById('btn-imprimir');
    if (btnImprimir && !btnImprimir.dataset.ready) {
        btnImprimir.dataset.ready = '1';
        btnImprimir.addEventListener('click', () => window.print());
    }
}

/* ========== NOTIFICAÇÕES ========== */
function renderNotificacoes() {
    const container = document.getElementById('lista-notificacoes');
    if (!container) return;

    const notificacoes = [
        { texto: 'Fundação Pró-Sangue (Posto Clínicas - SP): Estoque crítico de sangue O- e plaquetas.', tag: 'RMSP' },
        { texto: 'Hemocentro Regional de Osasco: Campanha emergencial para captação de sangue tipo A+.', tag: 'RMSP' },
        { texto: 'Hemocentro do ABC (Santo André): Convocação de doadores cadastrados para cirurgias cardíacas.', tag: 'RMSP' },
        { texto: 'Hemocentro de Guarulhos: Atualização do protocolo sanitário Anvisa para triagem clínica.', tag: 'RMSP' },
        { texto: 'Fundação Pró-Sangue (Posto Dante Pazzanese): Atendimento prioritário aos sábados das 8h às 16h.', tag: 'RMSP' },
        { texto: 'Hemocentro Regional de São Bernardo do Campo: Alerta de baixo estoque de hemocomponentes B-.', tag: 'RMSP' },
        { texto: 'Hospital São Paulo (UNIFESP): Campanha universitária de incentivo à primeira doação de sangue.', tag: 'RMSP' },
        { texto: 'Rede RMSP Hemobanco: Sincronização de 1.480 cadastros efetuada com sucesso entre 10 hemocentros.', tag: 'RMSP' }
    ];

    container.innerHTML = notificacoes.map((n, i) => `
        <div class="notification-item">
            <span class="num">${i + 1}.</span>
            <span class="text">${n.texto}</span>
            <span class="tag">${n.tag}</span>
        </div>
    `).join('');
}

/* ========== UTILITÁRIOS ========== */
function showAlert(id, message, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = 'alert alert-' + type + ' show';
    setTimeout(() => el.classList.remove('show'), 5000);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    if (dateStr.includes('/')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function maskCPF(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) {
        v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
        v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (v.length > 3) {
        v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    input.value = v;
}

/* ========== INICIALIZAÇÃO ========== */
document.addEventListener('DOMContentLoaded', () => {
    initMockData();
    initLogin();

    // Máscara de CPF
    document.querySelectorAll('input[data-mask="cpf"]').forEach(input => {
        input.addEventListener('input', () => maskCPF(input));
    });

    // Se já estiver logado, entra direto no sistema
    const user = storage.getUser();
    if (user) {
        entrarNoSistema();
    } else {
        mostrarLogin();
    }
});
