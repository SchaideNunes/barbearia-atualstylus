const SUPABASE_URL = 'https://tnltiicshevuxkjsnkmm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubHRpaWNzaGV2dXhranNua21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDQwMzQsImV4cCI6MjA4NjQyMDAzNH0.7otLzZqWwzV1PUQCxrC9k-Y-KZ--QrQVVYllZKSFans';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const WHATSAPP_BARBEARIA = '5575991309594';

const BARBEIROS = [
    { id: 1, nome: 'Geilson', foto: 'assets/Geilson.jpg' },
    { id: 2, nome: 'Denilson', foto: 'assets/Denilson.jpg' }
];

const HORARIOS_GEILSON = [
    '08:30', '09:30', '10:00', '11:00', 
    '14:00', '14:30', '15:30', '16:00', 
    '17:00', '17:30', '18:00', '18:30'
];

const HORARIOS_DENILSON = [
    '08:30', '09:30', '10:00', '11:00', 
    '14:00', '14:30', '15:30', '16:00', 
    '17:00'
];

async function verificarHorariosDisponiveis(dataSelecionada, barbeiroId) {
    if (!barbeiroId || !dataSelecionada) return [];

    const id = parseInt(barbeiroId);
    let listaHorariosDoBarbeiro = [];

    if (id === 1) listaHorariosDoBarbeiro = HORARIOS_GEILSON;
    else if (id === 2) listaHorariosDoBarbeiro = HORARIOS_DENILSON;
    else return [];

    try {
        const { data: agendamentos, error } = await supabaseClient
            .from('agendamentos')
            .select('horario')
            .eq('data_agendamento', dataSelecionada)
            .eq('barbeiro_id', id)
            .neq('status', 'cancelado'); 

        if (error) {
            console.error('Erro Supabase:', error);
            return listaHorariosDoBarbeiro;
        }

        const horariosOcupados = agendamentos.map(ag => ag.horario);
        return listaHorariosDoBarbeiro.filter(h => !horariosOcupados.includes(h));

    } catch (err) {
        console.error(err);
        return listaHorariosDoBarbeiro;
    }
}

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

function mostrarPagina(nomePagina) {
    document.querySelectorAll('.pagina').forEach(p => p.classList.remove('ativa'));
    document.querySelectorAll('.link-menu').forEach(l => l.classList.remove('ativo'));

    const paginaId = 'pagina' + nomePagina.charAt(0).toUpperCase() + nomePagina.slice(1);
    const paginaElemento = document.getElementById(paginaId);

    if (paginaElemento) paginaElemento.classList.add('ativa');
    document.getElementById('navegacaoMobile').classList.add('hidden');
    document.getElementById('iconeMenu').classList.remove('hidden');
    document.getElementById('iconeFechar').classList.add('hidden');

    if (nomePagina === 'agendamento') {
        const campoData = document.getElementById('campoData');
        const hoje = new Date().toISOString().split('T')[0];
        campoData.min = hoje;
        
        // Coloca a data de HOJE como padrão se estiver vazia
        if (!campoData.value) {
            campoData.value = hoje;
        }
        
        atualizarHorariosDisponiveis();
    }
    
    window.scrollTo(0, 0);
}

document.getElementById('botaoMenuMobile').addEventListener('click', function() {
    document.getElementById('navegacaoMobile').classList.toggle('hidden');
    document.getElementById('iconeMenu').classList.toggle('hidden');
    document.getElementById('iconeFechar').classList.toggle('hidden');
});

function agendarServico(nomeServico) {
    mostrarPagina('agendamento');
    setTimeout(function() {
        const select = document.getElementById('campoServico');
        select.value = nomeServico;
        select.dispatchEvent(new Event('change'));
        
        document.querySelector('.container-agendamento').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

async function atualizarHorariosDisponiveis() {
    const campoData = document.getElementById('campoData');
    const campoHorario = document.getElementById('campoHorario');
    const barbeiroRadio = document.querySelector('input[name="barbeiro"]:checked');
    
    const dataSelecionada = campoData.value;
    const barbeiroId = barbeiroRadio ? barbeiroRadio.value : null;
  
    campoHorario.innerHTML = '<option value="">Carregando...</option>';
    campoHorario.disabled = true;

    if (!dataSelecionada || !barbeiroId) {
        campoHorario.innerHTML = '<option value="">Primeiro selecione data e barbeiro</option>';
        campoHorario.disabled = false;
        return;
    }

    const horariosDisponiveis = await verificarHorariosDisponiveis(dataSelecionada, barbeiroId);
    
    campoHorario.innerHTML = '<option value="">Selecione um horário</option>';
    campoHorario.disabled = false;

    if (horariosDisponiveis.length === 0) {
        const option = document.createElement('option');
        option.text = 'Dia cheio! Sem horários disponíveis.';
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

    verificarStatusBotao();
}

async function confirmarAgendamento() {
    const nome = document.getElementById('campoNome').value;
    const telefone = document.getElementById('campoTelefone').value;
    const servico = document.getElementById('campoServico').value;
    const barbeiroRadio = document.querySelector('input[name="barbeiro"]:checked');
    const data = document.getElementById('campoData').value;
    const horario = document.getElementById('campoHorario').value;
    const btnConfirmar = document.querySelector('.botao-confirmar');

    if (!nome || !telefone || !servico || !barbeiroRadio || !data || !horario) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const barbeiroId = parseInt(barbeiroRadio.value);
    const barbeiroNome = BARBEIROS.find(b => b.id === barbeiroId)?.nome || 'Barbeiro';

    const valorMatch = servico.match(/R\$ (\d+)/);
    const valor = valorMatch ? parseInt(valorMatch[1]) : 0;

    const textoOriginal = btnConfirmar.innerHTML;
    btnConfirmar.innerHTML = 'Salvando...';
    btnConfirmar.disabled = true;
    btnConfirmar.style.cursor = 'wait';

    try {
        const horariosLivres = await verificarHorariosDisponiveis(data, barbeiroId);
        if (!horariosLivres.includes(horario)) {
            alert('Ops! Alguém acabou de pegar esse horário. Por favor, escolha outro.');
            await atualizarHorariosDisponiveis();
            return;
        }

        const { error } = await supabaseClient
            .from('agendamentos')
            .insert([{
                nome: nome,
                telefone: telefone,
                servico: servico,
                valor: valor,
                barbeiro_id: barbeiroId,
                barbeiro_nome: barbeiroNome,
                data_agendamento: data,
                horario: horario,
                status: 'confirmado'
            }]);

        if (error) throw error;

        const dadosCliente = { nome: nome, telefone: telefone };
        localStorage.setItem('dadosClienteBarbearia', JSON.stringify(dadosCliente));

        enviarWhatsApp({ nome, telefone, servico, valor, barbeiroNome, data, horario });

        document.getElementById('campoNome').value = '';
        document.getElementById('campoTelefone').value = '';
        document.getElementById('campoServico').value = '';
        document.getElementById('campoData').value = new Date().toISOString().split('T')[0]; // Reseta para hoje
        barbeiroRadio.checked = false;
        await atualizarHorariosDisponiveis();
        
        alert('✅ Agendamento realizado com sucesso!');

    } catch (err) {
        console.error(err);
        alert('Erro ao agendar: ' + err.message);
    } finally {
        btnConfirmar.innerHTML = textoOriginal;
        verificarStatusBotao();
    }
}

function enviarWhatsApp(agendamento) {
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
        botao.style.opacity = '1';
        botao.style.cursor = 'pointer';
    } else {
        botao.disabled = true;
        botao.innerHTML = 'Preencha tudo para confirmar';
        botao.style.opacity = '0.5';
        botao.style.cursor = 'not-allowed';
    }
}

function aplicarMascaraTelefone(event) {
    let input = event.target;
    let valor = input.value.replace(/\D/g, '');

    if (valor.length > 11) {
        valor = valor.slice(0, 11);
    }

    if (valor.length > 2) {
        valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    }
    if (valor.length > 10) {
        valor = `${valor.slice(0, 10)}-${valor.slice(10)}`;
    }

    input.value = valor;
    verificarStatusBotao();
}

document.addEventListener('DOMContentLoaded', function() {
    const dadosSalvos = localStorage.getItem('dadosClienteBarbearia');
    if (dadosSalvos) {
        const cliente = JSON.parse(dadosSalvos);
        if (cliente.nome) document.getElementById('campoNome').value = cliente.nome;
        if (cliente.telefone) document.getElementById('campoTelefone').value = cliente.telefone;
    }

    const campoData = document.getElementById('campoData');
    if (campoData) {
        const hoje = new Date().toISOString().split('T')[0];
        campoData.min = hoje;
        campoData.value = hoje;
        campoData.addEventListener('change', atualizarHorariosDisponiveis);
    }

    const campoTelefone = document.getElementById('campoTelefone');
    if (campoTelefone) {
        campoTelefone.addEventListener('input', aplicarMascaraTelefone);
    }
    
    const barbeiroRadios = document.querySelectorAll('input[name="barbeiro"]');
    barbeiroRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            atualizarHorariosDisponiveis();
            verificarStatusBotao();
        });
    });

    const idsParaMonitorar = ['campoNome', 'campoTelefone', 'campoServico', 'campoData', 'campoHorario'];
    idsParaMonitorar.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', verificarStatusBotao);
            el.addEventListener('change', verificarStatusBotao);
        }
    });

    verificarStatusBotao();
    revelarNoScroll();
});