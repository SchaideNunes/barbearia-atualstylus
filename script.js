// VARIÁVEL DE CONTROLE DE LOGIN
let usuarioLogado = false;

// ========== CONFIGURAÇÕES DO WHATSAPP ==========
// IMPORTANTE: Altere este número para o WhatsApp da barbearia
const WHATSAPP_BARBEARIA = '5575988888888'; // Formato: código do país + DDD + número

// ========== SISTEMA DE BARBEIROS ==========
const BARBEIROS = [
    { id: 1, nome: 'Carlos Silva', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
    { id: 2, nome: 'Roberto Santos', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' }
];

// ========== SCROLL REVEAL EFFECT ==========
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

// Executar ao carregar e ao fazer scroll
window.addEventListener('scroll', revelarNoScroll);
window.addEventListener('load', revelarNoScroll);

// ========== AGENDAR SERVIÇO DIRETO ==========
function agendarServico(nomeServico) {
    // Ir para página de agendamento
    mostrarPagina('agendamento');
    
    // Aguardar um momento para garantir que a página foi carregada
    setTimeout(function() {
        // Preencher o campo de serviço
        document.getElementById('campoServico').value = nomeServico;
        
        // Scroll suave para o formulário
        document.querySelector('.container-agendamento').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// ========== MENU MOBILE ==========
document.getElementById('botaoMenuMobile').addEventListener('click', function() {
    const navegacaoMobile = document.getElementById('navegacaoMobile');
    const iconeMenu = document.getElementById('iconeMenu');
    const iconeFechar = document.getElementById('iconeFechar');
    
    navegacaoMobile.classList.toggle('hidden');
    iconeMenu.classList.toggle('hidden');
    iconeFechar.classList.toggle('hidden');
});

// ========== HORÁRIOS DISPONÍVEIS ==========
const todosHorarios = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
];

// FUNÇÃO PARA VERIFICAR HORÁRIOS DISPONÍVEIS POR BARBEIRO
function verificarHorariosDisponiveis(dataSelecionada, barbeiroId) {
    if (!barbeiroId) {
        return todosHorarios;
    }
    
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    const agendamentosDoBarbeiro = agendamentos.filter(ag => 
        ag.data === dataSelecionada && ag.barbeiroId === parseInt(barbeiroId)
    );
    const horariosOcupados = agendamentosDoBarbeiro.map(ag => ag.horario);
    return todosHorarios.filter(horario => !horariosOcupados.includes(horario));
}

// FUNÇÃO PARA ATUALIZAR DROPDOWN DE HORÁRIOS
function atualizarHorariosDisponiveis() {
    const campoData = document.getElementById('campoData');
    const campoHorario = document.getElementById('campoHorario');
    const barbeiroRadio = document.querySelector('input[name="barbeiro"]:checked');
    
    const dataSelecionada = campoData.value;
    const barbeiroId = barbeiroRadio ? barbeiroRadio.value : null;
    
    if (!dataSelecionada) {
        campoHorario.innerHTML = '<option value="">Selecione um horário</option>';
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
    campoHorario.innerHTML = '<option value="">Selecione um horário</option>';
    
    if (horariosDisponiveis.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Sem horários disponíveis para este barbeiro';
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

// ADICIONAR EVENTO DE MUDANÇA NA DATA E BARBEIRO
document.addEventListener('DOMContentLoaded', function() {
    const campoData = document.getElementById('campoData');
    const barbeiroRadios = document.querySelectorAll('input[name="barbeiro"]');
    
    if (campoData) {
        campoData.addEventListener('change', atualizarHorariosDisponiveis);
    }
    
    // Adicionar evento para cada radio button de barbeiro
    barbeiroRadios.forEach(radio => {
        radio.addEventListener('change', atualizarHorariosDisponiveis);
    });
    
    // Inicializar reveal on scroll
    revelarNoScroll();
});

// ========== MOSTRAR PÁGINAS ==========
function mostrarPagina(nomePagina) {
    // Esconder todas as páginas
    document.querySelectorAll('.pagina').forEach(pagina => {
        pagina.classList.remove('ativa');
    });
    
    // Remover classe ativa de todos os links
    document.querySelectorAll('.link-menu').forEach(link => {
        link.classList.remove('ativo');
    });

    // Verificar se é página admin e usuário não está logado
    if (nomePagina === 'admin' && !usuarioLogado) {
        nomePagina = 'login';
    }

    // Mostrar página selecionada
    const paginaId = 'pagina' + nomePagina.charAt(0).toUpperCase() + nomePagina.slice(1);
    document.getElementById(paginaId).classList.add('ativa');
    
    // Carregar agendamentos se for página admin
    if (nomePagina === 'admin') {
        carregarAgendamentos();
    }

    // Fechar menu mobile
    document.getElementById('navegacaoMobile').classList.add('hidden');
    document.getElementById('iconeMenu').classList.remove('hidden');
    document.getElementById('iconeFechar').classList.add('hidden');

    // Definir data mínima no formulário de agendamento
    if (nomePagina === 'agendamento') {
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('campoData').min = hoje;
        
        // Atualizar horários disponíveis se já tem data selecionada
        atualizarHorariosDisponiveis();
    }

    // Scroll para o topo
    window.scrollTo(0, 0);
}

// ========== LOGIN ADMIN ==========
function fazerLogin() {
    const senha = document.getElementById('campoSenhaAdmin').value;
    
    if (senha === 'admin123') {
        usuarioLogado = true;
        
        // Mostrar/esconder botões de admin
        document.getElementById('botaoAdmin').classList.add('hidden');
        document.getElementById('botaoSair').classList.remove('hidden');
        document.getElementById('botaoAdminMobile').classList.add('hidden');
        document.getElementById('botaoSairMobile').classList.remove('hidden');
        
        // Ir para página admin
        mostrarPagina('admin');
        
        // Limpar campo de senha
        document.getElementById('campoSenhaAdmin').value = '';
    } else {
        alert('Senha incorreta!');
    }
}

// ========== DESLOGAR ==========
function deslogar() {
    usuarioLogado = false;
    
    // Mostrar/esconder botões
    document.getElementById('botaoAdmin').classList.remove('hidden');
    document.getElementById('botaoSair').classList.add('hidden');
    document.getElementById('botaoAdminMobile').classList.remove('hidden');
    document.getElementById('botaoSairMobile').classList.add('hidden');
    
    // Voltar para página inicial
    mostrarPagina('inicio');
}

// ========== CONFIRMAR AGENDAMENTO ==========
function confirmarAgendamento() {
    // Pegar valores dos campos
    const nome = document.getElementById('campoNome').value;
    const telefone = document.getElementById('campoTelefone').value;
    const servico = document.getElementById('campoServico').value;
    const barbeiroRadio = document.querySelector('input[name="barbeiro"]:checked');
    const barbeiroId = barbeiroRadio ? barbeiroRadio.value : null;
    const data = document.getElementById('campoData').value;
    const horario = document.getElementById('campoHorario').value;

    // Validar campos
    if (!nome || !telefone || !servico || !barbeiroId || !data || !horario) {
        alert('Por favor, preencha todos os campos e selecione um barbeiro!');
        return;
    }

    // Verificar se o horário ainda está disponível (segurança extra)
    const horariosDisponiveis = verificarHorariosDisponiveis(data, barbeiroId);
    if (!horariosDisponiveis.includes(horario)) {
        alert('Este horário acabou de ser reservado para este barbeiro. Por favor, escolha outro horário.');
        atualizarHorariosDisponiveis();
        return;
    }

    // Extrair valor do serviço
    const valorMatch = servico.match(/R\$ (\d+)/);
    const valor = valorMatch ? parseInt(valorMatch[1]) : 0;
    
    // Encontrar nome do barbeiro
    const barbeiro = BARBEIROS.find(b => b.id === parseInt(barbeiroId));

    // Criar objeto de agendamento CONFIRMADO
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

    // Salvar no localStorage
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    agendamentos.push(agendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    // Enviar notificação para WhatsApp da barbearia
    enviarWhatsApp(agendamento);

    // Limpar formulário
    document.getElementById('campoNome').value = '';
    document.getElementById('campoTelefone').value = '';
    document.getElementById('campoServico').value = '';
    const radioChecked = document.querySelector('input[name="barbeiro"]:checked');
    if (radioChecked) radioChecked.checked = false;
    document.getElementById('campoData').value = '';
    document.getElementById('campoHorario').innerHTML = '<option value="">Primeiro selecione data e barbeiro</option>';

    alert('✅ Agendamento realizado com sucesso! A barbearia receberá a confirmação via WhatsApp.');
}

// ========== MOSTRAR TELA DE PAGAMENTO PIX ==========
function mostrarTelaPagamentoPix(agendamento) {
    const container = document.querySelector('.container-agendamento');
    
    // Esconder formulário
    document.querySelector('.formulario-agendamento').style.display = 'none';
    
    // Mostrar informação de desconto se aplicado
    let infoDesconto = '';
    if (agendamento.descontoAplicado) {
        infoDesconto = `
            <div style="background: #10b981; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <p style="color: white; font-weight: bold; text-align: center;">
                    🎉 Desconto de R$ ${VALOR_DESCONTO},00 aplicado!
                </p>
                <p style="color: white; font-size: 0.875rem; text-align: center; margin-top: 0.5rem;">
                    Valor original: R$ ${agendamento.valorOriginal},00
                </p>
            </div>
        `;
    }
    
    // Criar tela de pagamento
    const telaPagamento = document.createElement('div');
    telaPagamento.className = 'tela-pagamento-pix';
    telaPagamento.innerHTML = `
        <div style="text-align: center;">
            <div style="background: #f59e0b; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                <svg style="width: 50px; height: 50px; color: black;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>
            
            <h2 style="color: white; font-size: 1.875rem; font-weight: bold; margin-bottom: 1rem;">
                Pagamento via PIX
            </h2>
            
            ${infoDesconto}
            
            <div style="background: white; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 1.5rem;">
                <p style="color: #1f2937; font-size: 1.125rem; margin-bottom: 0.5rem;">
                    <strong>Valor a pagar:</strong>
                </p>
                <p style="color: #f59e0b; font-size: 2.5rem; font-weight: bold;">
                    R$ ${agendamento.valor},00
                </p>
            </div>
            
            <div style="background: #374151; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 1.5rem; text-align: left;">
                <h3 style="color: #f59e0b; font-weight: bold; margin-bottom: 1rem; text-align: center;">
                    📋 Resumo do Agendamento
                </h3>
                <p style="color: #d1d5db; margin-bottom: 0.5rem;">
                    <strong>Barbeiro:</strong> ${agendamento.barbeiroNome}
                </p>
                <p style="color: #d1d5db; margin-bottom: 0.5rem;">
                    <strong>Serviço:</strong> ${agendamento.servico}
                </p>
                <p style="color: #d1d5db; margin-bottom: 0.5rem;">
                    <strong>Data:</strong> ${new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
                <p style="color: #d1d5db;">
                    <strong>Horário:</strong> ${agendamento.horario}
                </p>
            </div>
            
            <div style="background: #1f2937; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 1.5rem;">
                <h3 style="color: white; font-weight: bold; margin-bottom: 1rem;">
                    Chave PIX:
                </h3>
                <div style="background: #374151; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <p id="chavePix" style="color: #f59e0b; font-size: 1.25rem; font-weight: bold; word-break: break-all;">
                        ${CHAVE_PIX}
                    </p>
                </div>
                <button onclick="copiarChavePix()" style="background: #374151; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; cursor: pointer; width: 100%; font-weight: 600; transition: background 0.3s;">
                    📋 Copiar Chave PIX
                </button>
            </div>
            
            <div style="background: #374151; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <p style="color: #d1d5db; font-size: 0.875rem; text-align: left;">
                    <strong style="color: #f59e0b;">⚠️ Instruções:</strong><br>
                    1. Copie a chave PIX acima<br>
                    2. Abra seu app bancário<br>
                    3. Faça o pagamento de <strong>R$ ${agendamento.valor},00</strong><br>
                    4. Clique em "Enviar Comprovante" abaixo
                </p>
            </div>
            
            <button onclick="enviarComprovantePix(${agendamento.id})" style="background: #10b981; color: white; padding: 1rem 2rem; border-radius: 0.5rem; font-size: 1.125rem; font-weight: bold; border: none; cursor: pointer; width: 100%; margin-bottom: 1rem; transition: all 0.3s;">
                ✅ Enviar Comprovante via WhatsApp
            </button>
            
            <button onclick="cancelarPagamento(${agendamento.id})" style="background: #374151; color: #d1d5db; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; cursor: pointer; width: 100%; transition: background 0.3s;">
                Cancelar
            </button>
        </div>
    `;
    
    container.appendChild(telaPagamento);
}

// ========== COPIAR CHAVE PIX ==========
function copiarChavePix() {
    const chavePix = document.getElementById('chavePix');
    const textoChave = chavePix.textContent;
    
    // Copiar para área de transferência
    navigator.clipboard.writeText(textoChave).then(function() {
        alert('✅ Chave PIX copiada! Cole no seu app bancário.');
    }).catch(function() {
        // Fallback para navegadores antigos
        const textarea = document.createElement('textarea');
        textarea.value = textoChave;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('✅ Chave PIX copiada! Cole no seu app bancário.');
    });
}

// ========== ENVIAR COMPROVANTE VIA WHATSAPP ==========
function enviarComprovantePix(idAgendamento) {
    // Buscar agendamento
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    const agendamento = agendamentos.find(ag => ag.id === idAgendamento);
    
    if (!agendamento) {
        alert('Erro ao buscar agendamento!');
        return;
    }
    
    // Formatar data
    const dataFormatada = new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR');
    
    // Montar mensagem para enviar comprovante
    const mensagem = `🔔 *COMPROVANTE DE PAGAMENTO* 🔔

👤 *Cliente:* ${agendamento.nome}
📱 *Telefone:* ${agendamento.telefone}
📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${agendamento.horario}
✂️ *Serviço:* ${agendamento.servico}
💰 *Valor Pago:* R$ ${agendamento.valor},00

_Enviando comprovante de pagamento PIX_
_Por favor, confirme o recebimento_`;

    // Abrir WhatsApp
    const url = `https://wa.me/${WHATSAPP_BARBEARIA}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    
    // Mostrar mensagem de sucesso
    alert('✅ Seu agendamento foi registrado! Envie o comprovante pelo WhatsApp e aguarde a confirmação da barbearia.');
    
    // Voltar para página inicial
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// ========== CANCELAR PAGAMENTO ==========
function cancelarPagamento(idAgendamento) {
    if (confirm('Deseja cancelar este agendamento?')) {
        // Remover agendamento pendente
        let agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
        agendamentos = agendamentos.filter(ag => ag.id !== idAgendamento);
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        
        // Recarregar página
        window.location.reload();
    }
}

// ========== ENVIAR WHATSAPP ==========
function enviarWhatsApp(agendamento) {
    // Formatar telefone do cliente (remover caracteres não numéricos)
    const telefoneCliente = agendamento.telefone.replace(/\D/g, '');
    
    // Formatar data
    const dataFormatada = new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR');
    
    // Montar mensagem para a BARBEARIA
    const mensagem = `🔔 *NOVO AGENDAMENTO* 🔔

👤 *Cliente:* ${agendamento.nome}
📱 *Telefone:* ${agendamento.telefone}
👨‍💼 *Barbeiro:* ${agendamento.barbeiroNome}
📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${agendamento.horario}
✂️ *Serviço:* ${agendamento.servico}
💰 *Valor:* R$ ${agendamento.valor},00

_Agendamento realizado via site_`;

    // Criar URL do WhatsApp da BARBEARIA
    const url = `https://wa.me/${WHATSAPP_BARBEARIA}?text=${encodeURIComponent(mensagem)}`;
    
    // Abrir WhatsApp em nova aba
    window.open(url, '_blank');
}

// ========== ENVIAR NOTIFICAÇÃO DE CANCELAMENTO ==========
function enviarCancelamentoWhatsApp(agendamento) {
    // Formatar data
    const dataFormatada = new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR');
    
    // Montar mensagem de cancelamento para a BARBEARIA
    const mensagem = `❌ *AGENDAMENTO CANCELADO* ❌

👤 *Cliente:* ${agendamento.nome}
📱 *Telefone:* ${agendamento.telefone}
📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${agendamento.horario}
✂️ *Serviço:* ${agendamento.servico}

_Cancelamento realizado via painel admin_`;

    // Criar URL do WhatsApp da BARBEARIA
    const url = `https://wa.me/${WHATSAPP_BARBEARIA}?text=${encodeURIComponent(mensagem)}`;
    
    // Abrir WhatsApp em nova aba
    window.open(url, '_blank');
}

// ========== CARREGAR AGENDAMENTOS NO ADMIN ==========
function carregarAgendamentos() {
    // Buscar agendamentos do localStorage
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    
    const lista = document.getElementById('listaAgendamentos');
    const contador = document.getElementById('contadorAgendamentos');

    // Atualizar contador
    contador.textContent = `${agendamentos.length} agendamento${agendamentos.length !== 1 ? 's' : ''}`;

    // Se não houver agendamentos
    if (agendamentos.length === 0) {
        lista.innerHTML = `
            <div style="background: #1a1a1a; border-radius: 0.75rem; padding: 3rem; text-align: center; border: 1px solid #333333;">
                <svg style="height: 5rem; width: 5rem; color: #666; margin: 0 auto 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p style="color: #999; font-size: 1.25rem;">Nenhum agendamento ainda</p>
            </div>
        `;
        return;
    }

    // Ordenar agendamentos por data e horário
    agendamentos.sort((a, b) => {
        const dataA = new Date(a.data + 'T' + a.horario);
        const dataB = new Date(b.data + 'T' + b.horario);
        return dataA - dataB;
    });

    // Criar HTML dos agendamentos
    lista.innerHTML = agendamentos.map(ag => {
        const dataFormatada = new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR');
        
        return `
            <div class="cartao-agendamento reveal" style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                    <h3 style="font-size: 1.25rem; font-weight: bold; color: white;">${ag.nome}</h3>
                    <span style="background: #10b981; color: white; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600;">
                        ✅ Confirmado
                    </span>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 1rem; color: #d1d5db;">
                    <span>📱 ${ag.telefone}</span>
                    <span>👨‍💼 ${ag.barbeiroNome}</span>
                    <span>📅 ${dataFormatada}</span>
                    <span>🕐 ${ag.horario}</span>
                    <span>💰 R$ ${ag.valor},00</span>
                </div>
                <p style="color: white; font-weight: 600;">${ag.servico}</p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    <button onclick="cancelarAgendamento(${ag.id})" class="botao-cancelar">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Ativar reveal nos novos elementos
    revelarNoScroll();
}

// ========== CANCELAR AGENDAMENTO ==========
function cancelarAgendamento(id) {
    if (confirm('Deseja cancelar este agendamento?')) {
        // Buscar agendamentos
        let agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
        
        // Encontrar o agendamento que será cancelado
        const agendamentoCancelado = agendamentos.find(ag => ag.id === id);
        
        // Filtrar agendamento a ser cancelado
        agendamentos = agendamentos.filter(ag => ag.id !== id);
        
        // Salvar novamente
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        
        // Enviar notificação de cancelamento via WhatsApp
        if (agendamentoCancelado) {
            enviarCancelamentoWhatsApp(agendamentoCancelado);
        }
        
        // Recarregar lista
        carregarAgendamentos();
        
        alert('Agendamento cancelado! Uma notificação será enviada via WhatsApp.');
    }
}

// ========== VALIDAÇÃO DO BOTÃO CONFIRMAR ==========

// Função que verifica se tudo está preenchido
function verificarStatusBotao() {
    // Pegar elementos
    const nome = document.getElementById('campoNome').value.trim();
    const telefone = document.getElementById('campoTelefone').value.trim();
    const servico = document.getElementById('campoServico').value;
    const data = document.getElementById('campoData').value;
    const horario = document.getElementById('campoHorario').value;
    const barbeiroSelecionado = document.querySelector('input[name="barbeiro"]:checked');
    const botao = document.querySelector('.botao-confirmar');

    // Verificar se todos têm valor
    const formularioCompleto = nome && telefone && servico && data && horario && barbeiroSelecionado;

    // Ativar ou Desativar botão
    if (formularioCompleto) {
        botao.disabled = false;
        botao.innerHTML = 'Confirmar Agendamento';
    } else {
        botao.disabled = true;
        // Opcional: Mostra o que falta ou apenas deixa bloqueado
        botao.innerHTML = 'Preencha tudo para confirmar';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    const camposTexto = ['campoNome', 'campoTelefone'];
    camposTexto.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('input', verificarStatusBotao);
        }
    });

    const camposSelecao = ['campoServico', 'campoData', 'campoHorario'];
    camposSelecao.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('change', verificarStatusBotao);
        }
    });

    const radiosBarbeiro = document.querySelectorAll('input[name="barbeiro"]');
    radiosBarbeiro.forEach(radio => {
        radio.addEventListener('change', verificarStatusBotao);
    });

    verificarStatusBotao();
});

// ========== FUNÇÃO PARA MIGRAÇÃO FUTURA PARA BANCO DE DADOS ==========
/*
QUANDO INTEGRAR COM BANCO DE DADOS, SUBSTITUA ESTAS FUNÇÕES:

// Buscar horários disponíveis do banco
async function verificarHorariosDisponiveisDB(dataSelecionada, barbeiroId) {
    const response = await fetch(`/api/horarios-disponiveis?data=${dataSelecionada}&barbeiroId=${barbeiroId}`);
    const data = await response.json();
    return data.horariosDisponiveis;
}

// Criar agendamento no banco
async function criarAgendamentoDB(agendamento) {
    const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento)
    });
    return await response.json();
}

// Listar agendamentos do banco
async function listarAgendamentosDB() {
    const response = await fetch('/api/agendamentos');
    return await response.json();
}

// Cancelar agendamento no banco
async function cancelarAgendamentoDB(id) {
    const response = await fetch(`/api/agendamentos/${id}`, {
        method: 'DELETE'
    });
    return await response.json();
}
*/