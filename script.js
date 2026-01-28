// VARIÁVEL DE CONTROLE DE LOGIN
let usuarioLogado = false;

// ========== CONFIGURAÇÕES DO WHATSAPP ==========
// IMPORTANTE: Altere este número para o WhatsApp da barbearia
const WHATSAPP_BARBEARIA = '5575988888888'; // Formato: código do país + DDD + número

// ========== CONFIGURAÇÕES PIX ==========
// IMPORTANTE: Altere para a chave PIX da barbearia
const CHAVE_PIX = '75988888888'; // Pode ser: telefone, email, CPF, CNPJ ou chave aleatória
const NOME_FAVORECIDO = 'AtualStylus Barbearia';
const CIDADE_FAVORECIDO = 'Olindina';

// ========== SISTEMA DE BARBEIROS ==========
const BARBEIROS = [
    { id: 1, nome: 'Carlos Silva', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
    { id: 2, nome: 'Roberto Santos', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
    { id: 3, nome: 'Fernando Lima', foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' }
];

// ========== SISTEMA DE FIDELIDADE ==========
const CORTES_PARA_DESCONTO = 5; // A cada 5 cortes
const VALOR_DESCONTO = 10; // R$ 10,00 de desconto

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
        return todosHorarios; // Retorna todos se não tem barbeiro selecionado
    }
    
    // Buscar todos os agendamentos
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    
    // Filtrar agendamentos da data E barbeiro selecionado
    const agendamentosDoBarbeiro = agendamentos.filter(ag => 
        ag.data === dataSelecionada && ag.barbeiroId === parseInt(barbeiroId)
    );
    
    // Pegar horários já ocupados
    const horariosOcupados = agendamentosDoBarbeiro.map(ag => ag.horario);
    
    // Retornar apenas horários disponíveis
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
        // Se não tem data selecionada, mostrar todos os horários
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
    
    // Buscar horários disponíveis
    const horariosDisponiveis = verificarHorariosDisponiveis(dataSelecionada, barbeiroId);
    
    // Limpar dropdown
    campoHorario.innerHTML = '<option value="">Selecione um horário</option>';
    
    // Se não há horários disponíveis
    if (horariosDisponiveis.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Sem horários disponíveis para este barbeiro';
        option.disabled = true;
        campoHorario.appendChild(option);
        return;
    }
    
    // Adicionar horários disponíveis
    horariosDisponiveis.forEach(horario => {
        const option = document.createElement('option');
        option.value = horario;
        option.textContent = horario;
        campoHorario.appendChild(option);
    });
}

// ========== SISTEMA DE FIDELIDADE ==========
// Verificar quantos cortes o cliente já tem
function verificarFidelidade(telefone) {
    const clientes = JSON.parse(localStorage.getItem('clientes_fidelidade') || '{}');
    return clientes[telefone] || { cortes: 0, descontoDisponivel: false };
}

// Atualizar fidelidade do cliente
function atualizarFidelidade(telefone) {
    const clientes = JSON.parse(localStorage.getItem('clientes_fidelidade') || '{}');
    
    if (!clientes[telefone]) {
        clientes[telefone] = { cortes: 0, descontoDisponivel: false };
    }
    
    clientes[telefone].cortes += 1;
    
    // Verificar se ganhou desconto
    if (clientes[telefone].cortes >= CORTES_PARA_DESCONTO) {
        clientes[telefone].descontoDisponivel = true;
        clientes[telefone].cortes = 0; // Resetar contador
    }
    
    localStorage.setItem('clientes_fidelidade', JSON.stringify(clientes));
    return clientes[telefone];
}

// Usar desconto da fidelidade
function usarDescontoFidelidade(telefone) {
    const clientes = JSON.parse(localStorage.getItem('clientes_fidelidade') || '{}');
    
    if (clientes[telefone] && clientes[telefone].descontoDisponivel) {
        clientes[telefone].descontoDisponivel = false;
        localStorage.setItem('clientes_fidelidade', JSON.stringify(clientes));
        return true;
    }
    
    return false;
}

// Mostrar status de fidelidade
function mostrarStatusFidelidade(telefone) {
    const fidelidade = verificarFidelidade(telefone);
    const statusDiv = document.getElementById('statusFidelidade');
    
    if (!statusDiv) return;
    
    if (fidelidade.descontoDisponivel) {
        statusDiv.innerHTML = `
            <div style="background: #10b981; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center;">
                <p style="color: white; font-weight: bold; margin-bottom: 0.5rem;">
                    🎉 PARABÉNS! Você tem um desconto disponível!
                </p>
                <p style="color: white; font-size: 1.5rem; font-weight: bold;">
                    R$ ${VALOR_DESCONTO},00 OFF
                </p>
                <label style="color: white; display: flex; align-items: center; justify-content: center; margin-top: 0.5rem; cursor: pointer;">
                    <input type="checkbox" id="usarDesconto" style="margin-right: 0.5rem; width: 20px; height: 20px;">
                    Usar meu desconto neste agendamento
                </label>
            </div>
        `;
    } else {
        const faltam = CORTES_PARA_DESCONTO - fidelidade.cortes;
        statusDiv.innerHTML = `
            <div style="background: #374151; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center;">
                <p style="color: #d1d5db; margin-bottom: 0.5rem;">
                    💳 Programa de Fidelidade
                </p>
                <p style="color: #f59e0b; font-weight: bold; font-size: 1.125rem;">
                    ${fidelidade.cortes} de ${CORTES_PARA_DESCONTO} cortes
                </p>
                <p style="color: #9ca3af; font-size: 0.875rem; margin-top: 0.5rem;">
                    Faltam apenas ${faltam} corte${faltam > 1 ? 's' : ''} para ganhar R$ ${VALOR_DESCONTO},00 OFF!
                </p>
            </div>
        `;
    }
}

// ADICIONAR EVENTO DE MUDANÇA NA DATA E BARBEIRO
document.addEventListener('DOMContentLoaded', function() {
    const campoData = document.getElementById('campoData');
    const barbeiroRadios = document.querySelectorAll('input[name="barbeiro"]');
    const campoTelefone = document.getElementById('campoTelefone');
    
    if (campoData) {
        campoData.addEventListener('change', atualizarHorariosDisponiveis);
    }
    
    // Adicionar evento para cada radio button de barbeiro
    barbeiroRadios.forEach(radio => {
        radio.addEventListener('change', atualizarHorariosDisponiveis);
    });
    
    // Verificar fidelidade quando preencher telefone
    if (campoTelefone) {
        campoTelefone.addEventListener('blur', function() {
            const telefone = this.value.replace(/\D/g, '');
            if (telefone.length >= 10) {
                mostrarStatusFidelidade(telefone);
            }
        });
    }
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
    let valor = valorMatch ? parseInt(valorMatch[1]) : 0;
    
    // Verificar se vai usar desconto
    const checkboxDesconto = document.getElementById('usarDesconto');
    let descontoAplicado = false;
    
    if (checkboxDesconto && checkboxDesconto.checked) {
        const telefoneClean = telefone.replace(/\D/g, '');
        if (usarDescontoFidelidade(telefoneClean)) {
            valor = Math.max(0, valor - VALOR_DESCONTO);
            descontoAplicado = true;
        }
    }
    
    // Encontrar nome do barbeiro
    const barbeiro = BARBEIROS.find(b => b.id === parseInt(barbeiroId));

    // Criar objeto de agendamento CONFIRMADO
    const agendamento = {
        id: Date.now(),
        nome: nome,
        telefone: telefone,
        servico: servico,
        valor: valor,
        valorOriginal: valorMatch ? parseInt(valorMatch[1]) : 0,
        descontoAplicado: descontoAplicado,
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

    // Atualizar fidelidade do cliente (se não usou desconto)
    if (!descontoAplicado) {
        const telefoneClean = telefone.replace(/\D/g, '');
        const novaFidelidade = atualizarFidelidade(telefoneClean);
        
        // Informar se ganhou desconto
        if (novaFidelidade.descontoDisponivel) {
            alert(`🎉 Parabéns! Você completou ${CORTES_PARA_DESCONTO} cortes e ganhou R$ ${VALOR_DESCONTO},00 de desconto no próximo agendamento!`);
        }
    }

    // Enviar notificação para WhatsApp da barbearia
    enviarWhatsApp(agendamento);

    // Limpar formulário
    document.getElementById('campoNome').value = '';
    document.getElementById('campoTelefone').value = '';
    document.getElementById('campoServico').value = '';
    document.querySelector('input[name="barbeiro"]:checked').checked = false;
    document.getElementById('campoData').value = '';
    document.getElementById('campoHorario').innerHTML = '<option value="">Primeiro selecione data e barbeiro</option>';
    
    // Limpar status de fidelidade
    const statusDiv = document.getElementById('statusFidelidade');
    if (statusDiv) {
        statusDiv.innerHTML = '';
    }

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
    
    // Mensagem com ou sem desconto
    let infoDesconto = '';
    if (agendamento.descontoAplicado) {
        infoDesconto = `\n💰 *Desconto Fidelidade:* R$ ${VALOR_DESCONTO},00\n💵 *Valor Original:* R$ ${agendamento.valorOriginal},00`;
    }
    
    // Montar mensagem para a BARBEARIA
    const mensagem = `🔔 *NOVO AGENDAMENTO* 🔔

👤 *Cliente:* ${agendamento.nome}
📱 *Telefone:* ${agendamento.telefone}
👨‍💼 *Barbeiro:* ${agendamento.barbeiroNome}
📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${agendamento.horario}
✂️ *Serviço:* ${agendamento.servico}
💰 *Valor:* R$ ${agendamento.valor},00${infoDesconto}

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
            <div class="bg-gray-800 rounded-xl p-12 text-center">
                <svg class="h-20 w-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-gray-400 text-xl">Nenhum agendamento ainda</p>
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
        
        let infoDesconto = '';
        if (ag.descontoAplicado) {
            infoDesconto = `<span class="text-green-400 font-semibold">🎉 Desconto aplicado: -R$ ${VALOR_DESCONTO},00</span>`;
        }
        
        return `
            <div class="cartao-agendamento">
                <div class="flex flex-col space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold text-white">${ag.nome}</h3>
                        <span class="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            ✅ Confirmado
                        </span>
                    </div>
                    <div class="flex flex-wrap gap-4 text-gray-300">
                        <span>📱 ${ag.telefone}</span>
                        <span>👨‍💼 ${ag.barbeiroNome}</span>
                        <span>📅 ${dataFormatada}</span>
                        <span>🕐 ${ag.horario}</span>
                        <span>💰 R$ ${ag.valor},00</span>
                    </div>
                    <p class="text-white font-semibold">${ag.servico}</p>
                    ${infoDesconto ? `<p>${infoDesconto}</p>` : ''}
                    <div class="flex flex-wrap gap-2">
                        <button onclick="cancelarAgendamento(${ag.id})" class="botao-cancelar">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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