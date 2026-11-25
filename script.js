const formulario = document.getElementById("fichaForm");

const nomeDoPaciente = document.getElementById("nomeDoPaciente");
const dataDaConsulta = document.getElementById("dataDaConsulta");
const horarioDaConsulta = document.getElementById("horarioDaConsulta");
const nomeDoMedico = document.getElementById("nomeDoMedico");
const nomeDoAgenteDeSaude = document.getElementById("nomeDoAgenteDeSaude");
const equipe = document.getElementById("equipe");
const configuracaoDaEquipe = {
    corFundo: "#FDF2F8",
    corTexto: "#9D174D"
};
const dimensoesDaFicha = {
    largura: 1300,
    altura: 800
};
const visualizacaoFicha = document.getElementById("visualizacaoFicha");
const baixarFicha = document.getElementById("baixarFicha");
const fichaFeedback = document.getElementById("fichaFeedback");
let identificadorDaCaptura = 0;

function ajustarEscalaDaPrevia() {
    const larguraDisponivel = visualizacaoFicha.clientWidth;
    const alturaDisponivel = visualizacaoFicha.clientHeight;
    const escala = Math.min(
        larguraDisponivel / dimensoesDaFicha.largura,
        alturaDisponivel / dimensoesDaFicha.altura
    );

    visualizacaoFicha.style.setProperty("--ficha-preview-scale", String(escala));
    visualizacaoFicha.style.setProperty(
        "--ficha-preview-left",
        `${(larguraDisponivel - dimensoesDaFicha.largura * escala) / 2}px`
    );
    visualizacaoFicha.style.setProperty(
        "--ficha-preview-top",
        `${(alturaDisponivel - dimensoesDaFicha.altura * escala) / 2}px`
    );
}

const observadorDaPrevia = new ResizeObserver(ajustarEscalaDaPrevia);
observadorDaPrevia.observe(visualizacaoFicha);
ajustarEscalaDaPrevia();

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
        nomeDoAgenteDeSaude: nomeDoAgenteDeSaude.value,
        equipe: equipe.value
    };

    baixarFicha.disabled = true;
    window.canvasDaFicha = null;
    window.pngDaFicha = null;
    atualizarFeedback("Gerando sua ficha...", "is-pending");
    const capturaAtual = ++identificadorDaCaptura;
    visualizacaoFicha.replaceChildren();

    const fichaElement = criarFicha(ficha);
    visualizacaoFicha.appendChild(fichaElement);

    capturarFicha(capturaAtual, fichaElement);

    return ficha;
}

function criarFicha(ficha) {
    const fichaElement = document.createElement("article");
    fichaElement.className = "ficha";
    fichaElement.style.setProperty("--cor-equipe-fundo", configuracaoDaEquipe.corFundo);
    fichaElement.style.setProperty("--cor-equipe-texto", configuracaoDaEquipe.corTexto);

    const identificadorDaEquipe = document.createElement("div");
    identificadorDaEquipe.className = "ficha-equipe";
    identificadorDaEquipe.textContent = (ficha.equipe || "").toUpperCase();
    fichaElement.appendChild(identificadorDaEquipe);

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
            scale: 1,
            width: dimensoesDaFicha.largura,
            height: dimensoesDaFicha.altura,
            windowWidth: dimensoesDaFicha.largura,
            windowHeight: dimensoesDaFicha.altura,
            backgroundColor: configuracaoDaEquipe.corFundo,
            onclone: function(documentoClonado) {
                const fichaClonada = documentoClonado.querySelector("#visualizacaoFicha .ficha");
                const visualizacaoClonada = documentoClonado.getElementById("visualizacaoFicha");
                if (!fichaClonada || !visualizacaoClonada) {
                    throw new Error("Não foi possível localizar a ficha na cópia para captura.");
                }

                visualizacaoClonada.style.cssText = [
                    "position: fixed",
                    "top: 0",
                    "left: 0",
                    `width: ${dimensoesDaFicha.largura}px`,
                    `height: ${dimensoesDaFicha.altura}px`,
                    "aspect-ratio: auto",
                    "display: block",
                    "overflow: visible",
                    "padding: 0",
                    "border: 0",
                    "border-radius: 0",
                    "box-shadow: none"
                ].join(";");
                fichaClonada.style.position = "relative";
                fichaClonada.style.top = "0";
                fichaClonada.style.left = "0";
                fichaClonada.style.transform = "none";
            }
        });
        const png = canvas.toDataURL("image/png");

        if (capturaAtual !== identificadorDaCaptura) {
            return;
        }

        window.canvasDaFicha = canvas;
        window.pngDaFicha = png;
        baixarFicha.disabled = false;
        atualizarFeedback("Ficha pronta para baixar.", "is-success");
    } catch (erro) {
        if (capturaAtual !== identificadorDaCaptura) {
            return;
        }

        window.canvasDaFicha = null;
        window.pngDaFicha = null;
        baixarFicha.disabled = true;
        atualizarFeedback("Não foi possível preparar a ficha para download. Tente novamente.", "is-error");
        console.error("Não foi possível capturar a ficha e convertê-la para PNG.", erro);
    }
}

function atualizarFeedback(mensagem, estado) {
    fichaFeedback.textContent = mensagem;
    fichaFeedback.className = `feedback ${estado}`;
    fichaFeedback.hidden = false;
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