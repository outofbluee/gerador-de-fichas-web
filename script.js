const API_URL = "https://gerador-de-fichas-java-backend.onrender.com";

const formulario = document.getElementById("fichaForm");

const nomeDoPaciente = document.getElementById("nomeDoPaciente");
const dataDaConsulta = document.getElementById("dataDaConsulta");
const horarioDaConsulta = document.getElementById("horarioDaConsulta");
const nomeDoMedico = document.getElementById("nomeDoMedico");
const nomeDoAgenteDeSaude = document.getElementById("nomeDoAgenteDeSaude");

const fichaGerada = document.getElementById("fichaGerada");
const baixarFichaBtn = document.getElementById("baixarFicha");

let imagemUrl;


formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    gerar();
});

baixarFichaBtn.addEventListener("click", function() {
    if (imagemUrl !== null) {
        const link = document.createElement("a");

        link.href = imagemUrl;
        link.download = "ficha.png";

        link.click();
    };
});

function gerar() {
    const ficha = {
        nomeDoPaciente: nomeDoPaciente.value,
        dataDaConsulta: dataDaConsulta.value,
        horarioDaConsulta: horarioDaConsulta.value,
        nomeDoMedico: nomeDoMedico.value,
        nomeDoAgenteDeSaude: nomeDoAgenteDeSaude.value
    };

    fetch(`${API_URL}/api/v1/fichas`, 
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(ficha)
    })
    .then(response => {
        return response.blob();
    })
    .then(blob => {
        imagemUrl = URL.createObjectURL(blob);
        fichaGerada.src = imagemUrl;
    })
    .catch(error => {
        console.error(error);
    });
}