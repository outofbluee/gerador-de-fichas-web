const formulario = document.getElementById("fichaForm");

const nomeDoPaciente = document.getElementById("nomeDoPaciente");
const dataDaConsulta = document.getElementById("dataDaConsulta");
const horarioDaConsulta = document.getElementById("horarioDaConsulta");
const nomeDoMedico = document.getElementById("nomeDoMedico");
const nomeDoAgenteDeSaude = document.getElementById("nomeDoAgenteDeSaude");
const visualizacaoFicha = document.getElementById("visualizacaoFicha");
const fichaParaCaptura = document.getElementById("fichaParaCaptura");
const baixarFicha = document.getElementById("baixarFicha");
let identificadorDaCaptura = 0;

baixarFicha.addEventListener("click", baixarFichaComoPng);

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

    baixarFicha.disabled = true;
    window.canvasDaFicha = null;
    window.pngDaFicha = null;
    const capturaAtual = ++identificadorDaCaptura;
    visualizacaoFicha.replaceChildren();
    fichaParaCaptura.replaceChildren();

    visualizacaoFicha.appendChild(criarFicha(ficha));
    fichaParaCaptura.appendChild(criarFicha(ficha));

    capturarFicha(capturaAtual, fichaParaCaptura.firstElementChild);

    return ficha;
}

function criarFicha(ficha) {
    const fichaElement = document.createElement("article");
    fichaElement.className = "ficha";

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

        fichaElement.appendChild(bloco);
    });

    return fichaElement;
}

async function capturarFicha(capturaAtual, fichaElement) {
    try {
        if (typeof html2canvas !== "function") {
            throw new Error("A biblioteca html2canvas não está disponível.");
        }

        const canvas = await html2canvas(fichaElement, {
            scale: 2
        });
        const png = canvas.toDataURL("image/png");

        if (capturaAtual !== identificadorDaCaptura) {
            return;
        }

        window.canvasDaFicha = canvas;
        window.pngDaFicha = png;
        baixarFicha.disabled = false;
    } catch (erro) {
        if (capturaAtual !== identificadorDaCaptura) {
            return;
        }

        window.canvasDaFicha = null;
        window.pngDaFicha = null;
        baixarFicha.disabled = true;
        console.error("Não foi possível capturar a ficha e convertê-la para PNG.", erro);
    }
}

function baixarFichaComoPng() {
    if (typeof window.pngDaFicha !== "string" || !window.pngDaFicha.startsWith("data:image/png;base64,")) {
        baixarFicha.disabled = true;
        console.error("Não há uma ficha PNG válida disponível para download.");
        return;
    }

    const link = document.createElement("a");
    link.href = window.pngDaFicha;
    link.download = "ficha.png";
    link.click();
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