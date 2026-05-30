const express = require("express");

const app = express();

app.use(express.json());

app.use(express.static(__dirname));



let comandoActual = "detener";

app.get("/", (req, res) => {

res.send(`




<!DOCTYPE html>
<html>

<head>
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>Robot ESP32</title>

<style>

body{
font-family: Arial;
background: linear-gradient(135deg,#141E30,#243B55);
color:white;
text-align:center;
margin:0;
}

.container{
margin-top:30px;
}

button{
width:180px;
height:70px;
margin:12px;
font-size:20px;
border:none;
border-radius:12px;
font-weight:bold;
cursor:pointer;
}

.control{
background:#00C853;
color:white;
}

.participantes{
background:#2979FF;
color:white;
}

.forward{
background:#00C853;
color:white;
}

.back{
background:#FF9100;
color:white;
}

.left{
background:#2979FF;
color:white;
}

.right{
background:#651FFF;
color:white;
}

.stop{
background:#FF1744;
color:white;
width:420px;
max-width:90%;
}

#estado{

background:rgba(255,255,255,0.1);

display:inline-block;

padding:10px 20px;

border-radius:12px;

margin-top:20px;

}

#menu{
margin-top:80px;
}

#controlPanel{
display:none;
}

#participantesPanel{
display:none;
margin-top:50px;
font-size:24px;
}

@media(max-width:600px){

button{
width:160px;
height:65px;
font-size:18px;
margin:8px;
}

.stop{
width:340px;
max-width:90%;
}

}

</style>

</head>

<body>

<div id="menu">

<div style="text-align:center;">

<img src="logo.png" width="150" height="150">

<br>

</div>

<h1>HOLA MAY</h1>

<button class="control"
onclick="mostrarControl()">
CONTROL
</button>

<br>

<button class="participantes"
onclick="mostrarParticipantes()">
COLABORADORES
</button>

</div>

<div id="controlPanel">

<h1>CONTROL ROBOT</h1>

<div class="container">

<button class="forward"
onclick="enviar('adelante')">
ADELANTE
</button>

<br>

<button class="left"
onclick="enviar('izquierda')">
IZQUIERDA
</button>

<button class="right"
onclick="enviar('derecha')">
DERECHA
</button>

<br>

<button class="back"
onclick="enviar('atras')">
ATRAS
</button>

<br>

<button class="stop"
onclick="enviar('detener')">
DETENER
</button>

</div>

<h2 id="estado">
Comando actual: detener
</h2>

<br>

<button onclick="volverMenu()">
VOLVER
</button>

</div>

<div id="participantesPanel">

<h1>Alumnos</h1>

<p>• Sebastian</p>
<p>•  </p>
<p>•  </p>

<h1>Docentes</h1>
<p>• Manuel loeza</p>
<p>• Edgar Chavez</p>

<br>

<button onclick="volverMenu()">
VOLVER
</button>

</div>

<script>

function mostrarControl(){

document.getElementById("menu").style.display="none";

document.getElementById("controlPanel").style.display="block";

}

function mostrarParticipantes(){

document.getElementById("menu").style.display="none";

document.getElementById("participantesPanel").style.display="block";

}

function volverMenu(){

document.getElementById("menu").style.display="block";

document.getElementById("controlPanel").style.display="none";

document.getElementById("participantesPanel").style.display="none";

}

async function enviar(cmd){

await fetch('/comando', {

method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({
cmd:cmd
})

});

document.getElementById("estado").innerHTML =
"Comando actual: " + cmd;

}

</script>

</body>

</html>




`);

});

app.post("/comando", (req, res) => {

comandoActual = req.body.cmd;

console.log("Comando:", comandoActual);

res.send("OK");

});

app.get("/comando", (req, res) => {

res.json({
comando: comandoActual
});

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

console.log("Servidor iniciado");

});

