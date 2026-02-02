// ========== CONSTANTES GERAIS ==========
const WHATSAPP_BARBEARIA = '5575991309594';

const BARBEIROS = [
    { id: 1, nome: 'Carlos Silva', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
    { id: 2, nome: 'Roberto Santos', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' }
];

// ========== EFEITOS VISUAIS (SCROLL REVEAL) ==========
function revelarNoScroll() {
    const elementos = document.querySelectorAll('.reveal');
    
    elementos.forEach(elemento => {
        const posicaoElemento = elemento.getBoundingClientRect().top;
        const alturaJanela = window.innerHeight;
        
        if (posicaoElemento < alturaJanela - 100) {
            elemento.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revelarNoScroll);
window.addEventListener('load', revelarNoScroll);

// ========== NAVEGAÇÃO E MENU ==========
function mostrarPagina(nomePagina) {
    // Esconder todas as páginas
    document.querySelectorAll('.pagina').forEach(pagina => {
        pagina.classList.remove('ativa');
    });
    
    // Remover classe ativa de todos os links
    document.querySelectorAll('.link-menu').forEach(link => {
        link.classList.remove('ativo');
    });

    // Mostrar página selecionada
    const paginaId = 'pagina' + nomePagina.charAt(0).toUpperCase() + nomePagina.slice(1);
    const paginaElemento = document.getElementById(paginaId);
    
    if (paginaElemento) {
        paginaElemento.classList.add('ativa');
    }
    
    // Fechar menu mobile se estiver aberto
    document.getElementById('navegacaoMobile').classList.add('hidden');
    document.getElementById('iconeMenu').classList.remove('hidden');
    document.getElementById('iconeFechar').classList.add('hidden');

    // Configurações específicas da página de agendamento
    if (nomePagina === 'agendamento') {
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('campoData').min = hoje;
        atualizarHorariosDisponiveis();
    }
    
    // Scroll para o topo
    window.scrollTo(0, 0);
}

// Menu Mobile Toggle
document.getElementById('botaoMenuMobile').addEventListener('click', function() {
    const navegacaoMobile = document.getElementById('navegacaoMobile');
    const iconeMenu = document.getElementById('iconeMenu');
    const iconeFechar = document.getElementById('iconeFechar');
    
    navegacaoMobile.classList.toggle('hidden');
    iconeMenu.classList.toggle('hidden');
    iconeFechar.classList.toggle('hidden');
});

// ========== LÓGICA DE AGENDAMENTO ==========

// Atalho para agendar serviço específico
function agendarServico(nomeServico) {
    mostrarPagina('agendamento');
    setTimeout(function() {
        document.getElementById('campoServico').value = nomeServico;
        // Disparar evento de change para validar o botão
        document.getElementById('campoServico').dispatchEvent(new Event('change'));
        
        document.querySelector('.container-agendamento').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// Sistema de Horários
const todosHorarios = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
];

function verificarHorariosDisponiveis(dataSelecionada, barbeiroId) {
    if (!barbeiroId) return todosHorarios;
    
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    const agendamentosDoBarbeiro = agendamentos.filter(ag => 
        ag.data === dataSelecionada && ag.barbeiroId === parseInt(barbeiroId)
    );
    const horariosOcupados = agendamentosDoBarbeiro.map(ag => ag.horario);
    return todosHorarios.filter(horario => !horariosOcupados.includes(horario));
}

function atualizarHorariosDisponiveis() {
    const campoData = document.getElementById('campoData');
    const campoHorario = document.getElementById('campoHorario');
    const barbeiroRadio = document.querySelector('input[name="barbeiro"]:checked');
    
    const dataSelecionada = campoData.value;
    const barbeiroId = barbeiroRadio ? barbeiroRadio.value : null;
    
    // Limpar select
    campoHorario.innerHTML = '<option value="">Selecione um horário</option>';

    if (!dataSelecionada) {
        todosHorarios.forEach(horario => {
            const option = document.createElement('option');
            option.value = horario;
            option.textContent = horario;
            campoHorario.appendChild(option);
        });
        return;
    }
    
    if (!barbeiroId) {
        campoHorario.innerHTML = '<option value="">Primeiro selecione um barbeiro</option>';
        return;
    }
    
    const horariosDisponiveis = verificarHorariosDisponiveis(dataSelecionada, barbeiroId);
    
    if (horariosDisponiveis.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Sem horários disponíveis';
        option.disabled = true;
        campoHorario.appendChild(option);
        return;
    }
    
    horariosDisponiveis.forEach(horario => {
        const option = document.createElement('option');
        option.value = horario;
        option.textContent = horario;
        campoHorario.appendChild(option);
    });
}

// ========== CONFIRMAÇÃO E ENVIO ==========

function confirmarAgendamento() {
    const nome = document.getElementById('campoNome').value;
    const telefone = document.getElementById('campoTelefone').value;
    const servico = document.getElementById('campoServico').value;
    const barbeiroRadio = document.querySelector('input[name="barbeiro"]:checked');
    const barbeiroId = barbeiroRadio ? barbeiroRadio.value : null;
    const data = document.getElementById('campoData').value;
    const horario = document.getElementById('campoHorario').value;

    if (!nome || !telefone || !servico || !barbeiroId || !data || !horario) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Verificar disponibilidade novamente
    const horariosDisponiveis = verificarHorariosDisponiveis(data, barbeiroId);
    if (!horariosDisponiveis.includes(horario)) {
        alert('Este horário acabou de ser reservado. Por favor, escolha outro.');
        atualizarHorariosDisponiveis();
        return;
    }

    // Extrair valor
    const valorMatch = servico.match(/R\$ (\d+)/);
    const valor = valorMatch ? parseInt(valorMatch[1]) : 0;
    
    // Buscar nome do barbeiro
    const barbeiro = BARBEIROS.find(b => b.id === parseInt(barbeiroId));

    const agendamento = {
        id: Date.now(),
        nome: nome,
        telefone: telefone,
        servico: servico,
        valor: valor,
        barbeiroId: parseInt(barbeiroId),
        barbeiroNome: barbeiro ? barbeiro.nome : 'Não especificado',
        data: data,
        horario: horario,
        status: 'confirmado',
        criadoEm: new Date().toISOString()
    };

    // Salvar (Temporário no LocalStorage, depois mudaremos para Supabase)
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    agendamentos.push(agendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    enviarWhatsApp(agendamento);

    // Resetar formulário
    document.getElementById('campoNome').value = '';
    document.getElementById('campoTelefone').value = '';
    document.getElementById('campoServico').value = '';
    if (barbeiroRadio) barbeiroRadio.checked = false;
    document.getElementById('campoData').value = '';
    document.getElementById('campoHorario').innerHTML = '<option value="">Primeiro selecione data e barbeiro</option>';
    
    // Atualizar estado do botão
    verificarStatusBotao();

    alert('✅ Agendamento realizado! A barbearia receberá a confirmação.');
}

function enviarWhatsApp(agendamento) {
    const telefoneClean = agendamento.telefone.replace(/\D/g, '');
    const dataFormatada = new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR');
    
    const mensagem = `🔔 *NOVO AGENDAMENTO* 🔔

👤 *Cliente:* ${agendamento.nome}
📱 *Telefone:* ${agendamento.telefone}
👨‍💼 *Barbeiro:* ${agendamento.barbeiroNome}
📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${agendamento.horario}
✂️ *Serviço:* ${agendamento.servico}
💰 *Valor:* R$ ${agendamento.valor},00

_Agendamento via site_`;

    const url = `https://wa.me/${WHATSAPP_BARBEARIA}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// ========== PAGAMENTO PIX (CLIENTE) ==========
// Mantido caso você queira usar o fluxo de pagamento depois
const CHAVE_PIX = '75991309594'; // Exemplo

function copiarChavePix() {
    const textoChave = CHAVE_PIX; // Ou pegue de um elemento HTML
    navigator.clipboard.writeText(textoChave).then(() => {
        alert('✅ Chave PIX copiada!');
    });
}

// ========== VALIDAÇÃO DO BOTÃO CONFIRMAR ==========
function verificarStatusBotao() {
    const nome = document.getElementById('campoNome').value.trim();
    const telefone = document.getElementById('campoTelefone').value.trim();
    const servico = document.getElementById('campoServico').value;
    const data = document.getElementById('campoData').value;
    const horario = document.getElementById('campoHorario').value;
    const barbeiroSelecionado = document.querySelector('input[name="barbeiro"]:checked');
    const botao = document.querySelector('.botao-confirmar');

    const formularioCompleto = nome && telefone && servico && data && horario && barbeiroSelecionado;

    if (formularioCompleto) {
        botao.disabled = false;
        botao.innerHTML = 'Confirmar Agendamento';
    } else {
        botao.disabled = true;
        botao.innerHTML = 'Preencha tudo para confirmar';
    }
}

// Event Listeners Globais
document.addEventListener('DOMContentLoaded', function() {
    const campoData = document.getElementById('campoData');
    const barbeiroRadios = document.querySelectorAll('input[name="barbeiro"]');
    
    // Horários
    if (campoData) campoData.addEventListener('change', atualizarHorariosDisponiveis);
    barbeiroRadios.forEach(radio => radio.addEventListener('change', atualizarHorariosDisponiveis));

    // Validação do Botão
    const camposTexto = ['campoNome', 'campoTelefone'];
    camposTexto.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', verificarStatusBotao);
    });

    const camposSelecao = ['campoServico', 'campoData', 'campoHorario'];
    camposSelecao.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', verificarStatusBotao);
    });

    barbeiroRadios.forEach(radio => radio.addEventListener('change', verificarStatusBotao));
    
    // Validação inicial
    verificarStatusBotao();
    revelarNoScroll();
});