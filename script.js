const SUPABASE_URL = CONFIG_SUPABASE.URL;
const SUPABASE_KEY = CONFIG_SUPABASE.KEY;

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const WHATSAPP_BARBEARIA = "5575991309594";

const BARBEIROS = [
  { id: 1, nome: "Geilson", foto: "assets/Geilson.jpg" },
  { id: 2, nome: "Denilson", foto: "assets/Denilson.jpg" },
];

const PADRAO_HORARIOS_GEILSON = ["08:30", "09:30", "10:00", "11:00", "14:00", "14:30", "15:30", "16:00", "17:00", "17:30", "18:00", "18:30"];
const PADRAO_HORARIOS_DENILSON = ["08:30", "09:30", "10:00", "11:00", "14:00", "14:30", "15:30", "16:00", "17:00"];

let cacheConfigHorarios = {};

async function verificarHorariosDisponiveis(dataSelecionada, barbeiroId) {
  if (!barbeiroId || !dataSelecionada) return [];

  const id = parseInt(barbeiroId);
  let listaHorariosDoBarbeiro = [];

  try {
    if (cacheConfigHorarios[id]) {
        listaHorariosDoBarbeiro = cacheConfigHorarios[id];
    } else {
        const { data: configDados, error: errConfig } = await supabaseClient
            .from("barbeiros_config")
            .select("horarios")
            .eq("id", id)
            .single();
            
        if (!errConfig && configDados && configDados.horarios) {
            listaHorariosDoBarbeiro = configDados.horarios;
            cacheConfigHorarios[id] = listaHorariosDoBarbeiro;
        } else {
            throw new Error("Usando fallback de horários");
        }
    }
  } catch (err) {
      if (id === 1) listaHorariosDoBarbeiro = PADRAO_HORARIOS_GEILSON;
      else if (id === 2) listaHorariosDoBarbeiro = PADRAO_HORARIOS_DENILSON;
      else return [];
  }

  try {
    const { data: agendamentos, error } = await supabaseClient
      .from("agendamentos")
      .select("horario")
      .eq("data_agendamento", dataSelecionada)
      .eq("barbeiro_id", id)
      .neq("status", "cancelado");

    if (error) {
      console.error("Erro Supabase:", error);
      return listaHorariosDoBarbeiro;
    }

    const horariosOcupados = agendamentos.map((ag) => ag.horario);
    let horariosLivres = listaHorariosDoBarbeiro.filter((h) => !horariosOcupados.includes(h));

    const dataLocal = new Date();
    const ano = dataLocal.getFullYear();
    const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
    const dia = String(dataLocal.getDate()).padStart(2, '0');
    const hojeStr = `${ano}-${mes}-${dia}`;

    if (dataSelecionada === hojeStr) {
      const horaAtual = dataLocal.getHours();
      const minAtual = dataLocal.getMinutes();
      horariosLivres = horariosLivres.filter((h) => {
        const [hSlot, mSlot] = h.split(':').map(Number);
        return hSlot > horaAtual || (hSlot === horaAtual && mSlot > minAtual);
      });
    }

    return horariosLivres;
  } catch (err) {
    console.error(err);
    return listaHorariosDoBarbeiro;
  }
}

function revelarNoScroll() {
  const elementos = document.querySelectorAll(".reveal");
  elementos.forEach((elemento) => {
    const posicaoElemento = elemento.getBoundingClientRect().top;
    const alturaJanela = window.innerHeight;

    if (posicaoElemento < alturaJanela - 100) {
      elemento.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revelarNoScroll);
window.addEventListener("load", revelarNoScroll);

function mostrarPagina(nomePagina) {
  document
    .querySelectorAll(".pagina")
    .forEach((p) => p.classList.remove("ativa"));
  document
    .querySelectorAll(".link-menu")
    .forEach((l) => l.classList.remove("ativo"));

  const paginaId =
    "pagina" + nomePagina.charAt(0).toUpperCase() + nomePagina.slice(1);
  const paginaElemento = document.getElementById(paginaId);

  if (paginaElemento) paginaElemento.classList.add("ativa");
  document.getElementById("navegacaoMobile").classList.add("hidden");
  document.getElementById("iconeMenu").classList.remove("hidden");
  document.getElementById("iconeFechar").classList.add("hidden");

  if (nomePagina === "agendamento") {
    const campoData = document.getElementById("campoData");
    const hoje = new Date().toISOString().split("T")[0];
    campoData.min = hoje;

    // Coloca a data de HOJE como padrão se estiver vazia
    if (!campoData.value) {
      campoData.value = hoje;
    }

    atualizarHorariosDisponiveis();
  }

  window.scrollTo(0, 0);
  if (nomePagina !== "meusAgendamentos") {
    history.replaceState(null, null, " ");
  }
}

document
  .getElementById("botaoMenuMobile")
  .addEventListener("click", function () {
    document.getElementById("navegacaoMobile").classList.toggle("hidden");
    document.getElementById("iconeMenu").classList.toggle("hidden");
    document.getElementById("iconeFechar").classList.toggle("hidden");
  });

function agendarServico(nomeServico) {
  mostrarPagina("agendamento");
  setTimeout(function () {
    const select = document.getElementById("campoServico");
    select.value = nomeServico;
    select.dispatchEvent(new Event("change"));

    document.querySelector(".container-agendamento").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}

async function atualizarHorariosDisponiveis() {
  const campoData = document.getElementById("campoData");
  const campoHorario = document.getElementById("campoHorario");
  const barbeiroRadio = document.querySelector(
    'input[name="barbeiro"]:checked',
  );

  const dataSelecionada = campoData.value;
  const barbeiroId = barbeiroRadio ? barbeiroRadio.value : null;

  if (dataSelecionada) {
    const dataObj = new Date(dataSelecionada + "T00:00:00");
    if (dataObj.getDay() === 0) {
      campoHorario.innerHTML = '<option value="">Domingo não há funcionamento</option>';
      campoHorario.disabled = true;
      return;
    }
  }

  campoHorario.innerHTML = '<option value="">Carregando...</option>';
  campoHorario.disabled = true;

  if (!dataSelecionada || !barbeiroId) {
    campoHorario.innerHTML =
      '<option value="">Primeiro selecione data e barbeiro</option>';
    campoHorario.disabled = false;
    return;
  }

  const horariosDisponiveis = await verificarHorariosDisponiveis(
    dataSelecionada,
    barbeiroId,
  );

  campoHorario.innerHTML = '<option value="">Selecione um horário</option>';
  campoHorario.disabled = false;

  if (horariosDisponiveis.length === 0) {
    const option = document.createElement("option");
    option.text = "Dia cheio! Sem horários disponíveis.";
    option.disabled = true;
    campoHorario.appendChild(option);
    return;
  }

  horariosDisponiveis.forEach((horario) => {
    const option = document.createElement("option");
    option.value = horario;
    option.textContent = horario;
    campoHorario.appendChild(option);
  });

  verificarStatusBotao();
}

function sanitizar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

async function confirmarAgendamento() {
  const nomeRaw = document.getElementById("campoNome").value;
  const telefoneRaw = document.getElementById("campoTelefone").value;
  
  const nome = sanitizar(nomeRaw);
  const telefone = sanitizar(telefoneRaw);
  const servico = document.getElementById("campoServico").value;
  const barbeiroRadio = document.querySelector(
    'input[name="barbeiro"]:checked',
  );
  const data = document.getElementById("campoData").value;
  const horario = document.getElementById("campoHorario").value;
  const btnConfirmar = document.querySelector(".botao-confirmar");

  if (!nome || !telefone || !servico || !barbeiroRadio || !data || !horario) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  if (telefone.length < 15) {
    alert("Por favor, digite um número de WhatsApp válido com o DDD.");
    return; // Para o agendamento na hora
  }

  const barbeiroId = parseInt(barbeiroRadio.value);
  const barbeiroNome =
    BARBEIROS.find((b) => b.id === barbeiroId)?.nome || "Barbeiro";

  const valorMatch = servico.match(/R\$ (\d+)/);
  const valor = valorMatch ? parseInt(valorMatch[1]) : 0;

  const textoOriginal = btnConfirmar.innerHTML;
  btnConfirmar.innerHTML = "Salvando...";
  btnConfirmar.disabled = true;
  btnConfirmar.style.cursor = "wait";

  try {
    const horariosLivres = await verificarHorariosDisponiveis(data, barbeiroId);
    if (!horariosLivres.includes(horario)) {
      alert(
        "Ops! Alguém acabou de pegar esse horário. Por favor, escolha outro.",
      );
      await atualizarHorariosDisponiveis();
      return;
    }

    const { error } = await supabaseClient.from("agendamentos").insert([
      {
        nome: nome,
        telefone: telefone,
        servico: servico,
        valor: valor,
        barbeiro_id: barbeiroId,
        barbeiro_nome: barbeiroNome,
        data_agendamento: data,
        horario: horario,
        status: "confirmado",
      },
    ]);

    if (error) throw error;

    const dadosCliente = { nome: nome, telefone: telefone };
    localStorage.setItem("dadosClienteBarbearia", JSON.stringify(dadosCliente));

    enviarWhatsApp({
      nome,
      telefone,
      servico,
      valor,
      barbeiroNome,
      data,
      horario,
    });

    document.getElementById("campoNome").value = "";
    document.getElementById("campoTelefone").value = "";
    document.getElementById("campoServico").value = "";
    document.getElementById("campoData").value = new Date()
      .toISOString()
      .split("T")[0]; // Reseta para hoje
    barbeiroRadio.checked = false;
    await atualizarHorariosDisponiveis();

    alert("✅ Agendamento realizado com sucesso!");
  } catch (err) {
    console.error(err);
    alert("Erro ao agendar: " + err.message);
  } finally {
    btnConfirmar.innerHTML = textoOriginal;
    verificarStatusBotao();
  }
}

function enviarWhatsApp(agendamento) {
  const dataFormatada = new Date(
    agendamento.data + "T00:00:00",
  ).toLocaleDateString("pt-BR");

  // ⚠️ IMPORTANTE: Substitui "seusite.com.br" pelo domínio real onde o site está hospedado
  const linkCancelamento = `https://atualestilo.com/#meusAgendamentos`;

  const mensagem = `🔔 *NOVO AGENDAMENTO* 🔔

👤 *Cliente:* ${agendamento.nome}
📱 *Telefone:* ${agendamento.telefone}
👨‍💼 *Barbeiro:* ${agendamento.barbeiroNome}
📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${agendamento.horario}
✂️ *Serviço:* ${agendamento.servico}
💰 *Valor:* R$ ${agendamento.valor},00

⚠️ *Precisa cancelar?*
Acesse: ${linkCancelamento}`;

  let numeroWhatsapp = WHATSAPP_BARBEARIA;
  if (agendamento.barbeiroNome === "Denilson") {
    numeroWhatsapp = "5575991073283";
  }

  const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
  window.location.href = url;
}

function verificarStatusBotao() {
  const nome = document.getElementById("campoNome")?.value.trim();
  const telefone = document.getElementById("campoTelefone")?.value.trim();
  const servico = document.getElementById("campoServico")?.value;
  const data = document.getElementById("campoData")?.value;
  const horario = document.getElementById("campoHorario")?.value;
  const barbeiroSelecionado = document.querySelector(
    'input[name="barbeiro"]:checked',
  );
  const botao = document.querySelector(".botao-confirmar");

  if (!botao) return;

  // A MÁGICA ESTÁ AQUI: telefone.length === 15 garante que ele digitou tudo!
  const isTelefoneValido = telefone && telefone.length === 15;

  const formularioCompleto =
    nome &&
    isTelefoneValido &&
    servico &&
    data &&
    horario &&
    barbeiroSelecionado;

  if (formularioCompleto) {
    botao.disabled = false;
    botao.innerHTML = "Confirmar Agendamento";
    botao.style.opacity = "1";
    botao.style.cursor = "pointer";
  } else {
    botao.disabled = true;

    // Muda o texto do botão para avisar o cliente do que falta
    if (telefone && telefone.length < 15 && telefone.length > 0) {
      botao.innerHTML = "Digite o WhatsApp completo com DDD";
    } else {
      botao.innerHTML = "Preencha tudo para confirmar";
    }

    botao.style.opacity = "0.5";
    botao.style.cursor = "not-allowed";
  }
}

function aplicarMascaraTelefone(event) {
  let input = event.target;
  let valor = input.value.replace(/\D/g, ""); // Remove tudo o que NÃO for número

  // Limita a 11 números no máximo (DDD 2 dígitos + Número 9 dígitos)
  if (valor.length > 11) {
    valor = valor.slice(0, 11);
  }

  // Aplica a formatação visual (XX) XXXXX-XXXX
  if (valor.length > 2) {
    valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
  }
  if (valor.length > 10) {
    valor = `${valor.slice(0, 10)}-${valor.slice(10)}`;
  }

  input.value = valor;

  // Chama a verificação do botão toda vez que o cliente digita uma tecla
  if (typeof verificarStatusBotao === "function") {
    verificarStatusBotao();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.hash === "#meusAgendamentos") {
    mostrarPagina("meusAgendamentos");
  }
  const dadosSalvos = localStorage.getItem("dadosClienteBarbearia");
  if (dadosSalvos) {
    const cliente = JSON.parse(dadosSalvos);
    if (cliente.nome) document.getElementById("campoNome").value = cliente.nome;
    if (cliente.telefone)
      document.getElementById("campoTelefone").value = cliente.telefone;
  }

  const campoData = document.getElementById("campoData");
  if (campoData) {
    const hoje = new Date().toISOString().split("T")[0];
    campoData.min = hoje;
    campoData.value = hoje;
    
    campoData.addEventListener("change", function() {
        const dataSelecionada = new Date(this.value + "T00:00:00");
        const diaSemana = dataSelecionada.getDay(); // 0 = Domingo

        if (diaSemana === 0) {
            alert("A barbearia não funciona aos domingos. Por favor, escolha outra data.");
            this.value = "";
            const campoHorario = document.getElementById("campoHorario");
            if (campoHorario) {
                campoHorario.innerHTML = '<option value="">Selecione outra data</option>';
            }
        } else {
            atualizarHorariosDisponiveis();
        }
    });
  }

  const campoTelefone = document.getElementById("campoTelefone");
  if (campoTelefone) {
    campoTelefone.addEventListener("input", aplicarMascaraTelefone);
  }

  const barbeiroRadios = document.querySelectorAll('input[name="barbeiro"]');
  barbeiroRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      atualizarHorariosDisponiveis();
      verificarStatusBotao();
    });
  });

  const idsParaMonitorar = [
    "campoNome",
    "campoTelefone",
    "campoServico",
    "campoData",
    "campoHorario",
  ];
  idsParaMonitorar.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", verificarStatusBotao);
      el.addEventListener("change", verificarStatusBotao);
    }
  });

  verificarStatusBotao();
  revelarNoScroll();
});

// Função para o cliente buscar os seus agendamentos
async function buscarMeusAgendamentos() {
  const telefoneInput = document.getElementById("buscaTelefoneCliente").value;
  const divLista = document.getElementById("listaMeusAgendamentos");

  if (telefoneInput.length < 14) {
    alert("Por favor, insira um número de WhatsApp válido.");
    return;
  }

  divLista.innerHTML =
    '<p class="texto-info-horario text-center">Buscando...</p>';

  try {
    const hoje = new Date().toISOString().split("T")[0];

    // Procura agendamentos do cliente que sejam de hoje em diante e estejam confirmados
    const { data: agendamentos, error } = await supabaseClient
      .from("agendamentos")
      .select("*")
      .eq("telefone", telefoneInput)
      .eq("status", "confirmado")
      .gte("data_agendamento", hoje)
      .order("data_agendamento", { ascending: true });

    if (error) throw error;

    if (agendamentos.length === 0) {
      divLista.innerHTML =
        '<p class="texto-info-horario text-center" style="color: #fca5a5;">Nenhum agendamento pendente encontrado para este número.</p>';
      return;
    }

    // Desenha os cards para o cliente
    divLista.innerHTML = agendamentos
      .map((ag) => {
        const dataBR = new Date(
          ag.data_agendamento + "T00:00:00",
        ).toLocaleDateString("pt-BR");
        return `
            <div style="background-color: #1f2937; border: 1px solid #374151; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="color: #fbbf24; margin-bottom: 10px; font-weight: bold;">${ag.servico}</h4>
                <p style="color: #d1d5db; font-size: 0.9rem; margin-bottom: 5px;">📅 Data: <strong>${dataBR}</strong> às <strong>${ag.horario}</strong></p>
                <p style="color: #d1d5db; font-size: 0.9rem; margin-bottom: 15px;">✂️ Barbeiro: <strong>${ag.barbeiro_nome}</strong></p>
                <button onclick="cancelarAgendamentoCliente(${ag.id})" style="background-color: #7f1d1d; color: #fca5a5; border: 1px solid #ef4444; padding: 8px 15px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold; transition: 0.3s;">
                    ❌ Cancelar Agendamento
                </button>
            </div>
            `;
      })
      .join("");
  } catch (err) {
    divLista.innerHTML = `<p style="color: red; text-align: center;">Erro na busca: ${err.message}</p>`;
  }
}

// Função para o cliente cancelar o agendamento
async function cancelarAgendamentoCliente(id) {
    if(!confirm("Tem certeza que deseja cancelar este agendamento? O horário será liberado imediatamente.")) return;
    
    try {
        // 1. Primeiro, buscamos os dados do agendamento para montar a mensagem
        const { data: agendamento, error: erroBusca } = await supabaseClient
            .from('agendamentos')
            .select('*')
            .eq('id', id)
            .single();

        if (erroBusca) throw erroBusca;

        // 2. Atualizamos o status para 'cancelado' no banco de dados
        const { error: erroUpdate } = await supabaseClient
            .from('agendamentos')
            .update({ status: 'cancelado' })
            .eq('id', id);

        if (erroUpdate) throw erroUpdate;

        // 3. Atualiza a tela para o cliente ver que sumiu
        alert("✅ Agendamento cancelado com sucesso!");
        buscarMeusAgendamentos(); 
        
        // 4. Monta a mensagem e envia para o WhatsApp do Barbeiro
        const dataFormatada = new Date(agendamento.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR');
        
        const mensagem = `❌ *AGENDAMENTO CANCELADO* ❌
        
Olá, acabei de cancelar o meu agendamento pelo site.

👤 *Cliente:* ${agendamento.nome}
👨‍💼 *Barbeiro:* ${agendamento.barbeiro_nome}
📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${agendamento.horario}
✂️ *Serviço:* ${agendamento.servico}`;

        let numeroWhatsapp = WHATSAPP_BARBEARIA;
        if (agendamento.barbeiro_nome === "Denilson") {
            numeroWhatsapp = "5575991073283";
        }

        // Redireciona para o WhatsApp (usa a mesma variável do agendamento)
        const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
        window.location.href = url;
        
    } catch (err) {
        alert("Erro ao tentar cancelar: " + err.message);
    }
}
