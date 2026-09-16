const formulario = document.getElementById("fichaForm");

const nomeDoPaciente = document.getElementById("nomeDoPaciente");
const dataDaConsulta = document.getElementById("dataDaConsulta");
const horarioDaConsulta = document.getElementById("horarioDaConsulta");
const nomeDoMedico = document.getElementById("nomeDoMedico");
const nomeDoAgenteDeSaude = document.getElementById("nomeDoAgenteDeSaude");
const visualizacaoFicha = document.getElementById("visualizacaoFicha");

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    gerar();
});

function gerar() {
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return null;
    }

    const ficha = {
        nomeDoPaciente: nomeDoPaciente.value,
        dataDaConsulta: dataDaConsulta.value,
        horarioDaConsulta: horarioDaConsulta.value,
        nomeDoMedico: nomeDoMedico.value,
        nomeDoAgenteDeSaude: nomeDoAgenteDeSaude.value
    };

    visualizacaoFicha.replaceChildren();

    const dataFormatada = formatarData(ficha.dataDaConsulta);
    const diaDaSemana = obterDiaDaSemana(ficha.dataDaConsulta);
    const blocosDaFicha = [
        [`Sr(a) ${ficha.nomeDoPaciente}`],
        ["Sua consulta foi agendada:"],
        [
            `Data: ${dataFormatada} (${diaDaSemana})`,
            `Horário: ${ficha.horarioDaConsulta} h por ordem de chegada`,
            `Médico(a): ${ficha.nomeDoMedico}`,
            `Agente de saúde: ${ficha.nomeDoAgenteDeSaude}`
        ],
        ["Ao chegar na recepção informe o nome de seu agente de saúde."],
        ["Documento de identificação com foto, CPF e cartão do SUS, se tiver."],
        ["Caso não possa comparecer, avise com antecedência!"]
    ];

    blocosDaFicha.forEach(function(linhasDoBloco) {
        const bloco = document.createElement("section");
        bloco.className = "ficha-bloco";

        linhasDoBloco.forEach(function(linha) {
            const linhaDaFicha = document.createElement("div");
            linhaDaFicha.textContent = linha;
            bloco.appendChild(linhaDaFicha);
        });

        visualizacaoFicha.appendChild(bloco);
    });

    return ficha;
}

function formatarData(data) {
    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
}

function obterDiaDaSemana(data) {
    const [ano, mes, dia] = data.split("-");
    const dataDaConsulta = new Date(Number(ano), Number(mes) - 1, Number(dia));

    return dataDaConsulta.toLocaleDateString("pt-BR", { weekday: "long" });
}