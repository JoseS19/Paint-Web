let cont = 0;
var puntos = new Array(4);
var color='black';
var grosor=1, grosorPrevio=1; 
var ladosP = 3;
var figura=0;
var dibujando = false;
var select = false;
var opcA = 0;
var desH = false;
var elfH = false;
var btnRe;
var btnElim = document.getElementById("btnElim");
var posFigS = null, posFigSAux = null;
var mover = false, cambiarPos = false, cambiarColor = null, escalar = false;;
var posMov = [];
var escInf = {};
var escSup = {};
var pixRe = {};
var difxMov = 0, difyMov = 0;
//var ini = {};
var esc1 = {};
var previo = false;
//var escalar = false;
var colorPrevio = 'black';
var colorFig = 'black'
var colorRelleno = 'white'
let Figura_lienzo = {};
let Posicion = {};
let pixeles = new Array();
let dibujado = [];
let dibujadoCopia = [];
let dibujadoAux = [];
var cuaRe = [];
var ext = {};
var reIn = [];
var guardarPos = false;
let encontrado=false;

function defColor(c){
    color=c;
    const color_n = document.querySelector('#color_a');
    color_n.style.backgroundColor = color;
    colorPrevio=c;
    colorFig = c;
    if(select && (posFigS!=null)){
        dibujadoCopia[posFigS].co = c;
        redibujado(dibujadoCopia);
        contornoSelect();
    }
}

function defGrosor(g){
    grosor=g;
    const ancho = document.querySelector('#ancho_a');
    ancho.textContent = 'Ancho: '+ g;
    grosorPrevio = g;
    if(select && (posFigS!=null)){
        dibujadoCopia[posFigS].gr = g;
        redibujado(dibujadoCopia);
        contornoSelect();
    }
}

function defLadosP(l){
    ladosP=l;
    cambiar_figura(figura);
}

function cambiar_figura(f){
    select = false;
    figura=f;
    const figura_n = document.querySelector('#figura_a');
    const pol_s = document.querySelector('#pol_s');
    if(figura==0){
        pol_s.style.display = 'none';
        figura_n.setAttribute("src", "./Figuras/lapiz.svg");
        figura_n.style.display = 'inline';
    }else if(figura==1){
        pol_s.style.display = 'none';
        figura_n.setAttribute("src", "./Figuras/linea.svg");
        figura_n.style.display = 'inline';
    }else if(figura==2){
        pol_s.style.display = 'none';
        figura_n.setAttribute("src", "./Figuras/circulo.svg");
        figura_n.style.display = 'inline';
    }else if(figura==3){
        pol_s.style.display = 'none';
        figura_n.setAttribute("src", "./Figuras/elipse.svg");
        figura_n.style.display = 'inline';
    }else if(figura==4){
        figura_n.style.display = 'none';
        pol_s.innerHTML = 'Poligono: ' +ladosP+ ' lados';
        pol_s.style.display = 'inline';
    }
    else if(figura==4){
        figura_n.style.display = 'none';
        pol_s.innerHTML = 'Seleccion';
        pol_s.style.display = 'inline';
    }
}

function accion(){
        select = true;
        figura = null;
}

function limpiar(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desH = true; 
    btnRe.removeAttribute('disabled');
    dibujadoCopia = [];
}

function guardar(formato){
    if(formato == 0){
        const o_texto = JSON.stringify(dibujado);
        console.log(o_texto);
        download(o_texto, 'Mi dibujo.json', 'application/json');
    }else if(formato == 1){
        redibujado(dibujadoCopia);
        let downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', 'CanvasAsImage.png');
        let canvas = document.getElementById('maincanvas');
        let dataURL = canvas.toDataURL('image/png');
        let url = dataURL.replace(/^data:image\/png/,'data:application/octet-stream');
        downloadLink.setAttribute('href',url);
        downloadLink.click();
    }
}

//----------Abrir archivo----------
const ar_entrada = document.getElementById('abrir_ar');
ar_entrada.addEventListener('change', function (e){
    const reader = new FileReader()
    reader.onload = function () {
        //console.log(reader.result)
        //console.log(JSON.parse(reader.result));
        const nuevo_dib = JSON.parse(reader.result);
        dibujadoCopia = new Array;
        dibujado = new Array;
        dibujadoCopia = nuevo_dib;
        redibujado(dibujadoCopia);
        dibujado = dibujadoCopia;
    }
    reader.readAsText(ar_entrada.files[0])
}, false);

//-- Deshacer - Rehacer --
function actualizar(opcA){
    if(opcA == 0){
        redibujado(dibujadoCopia);
    }
    else if (opcA == 1){  //--Deshacer--
        dibujadoCopia.pop();
        console.log(dibujadoCopia);
        redibujado(dibujadoCopia);
        //Habilitar botón de Rehacer
        desH = true;
        btnRe.removeAttribute('disabled')
    }
    else if (opcA == 2){  //--Rehacer--
        var elD = dibujadoCopia.length;
        dibujadoCopia.push(dibujado[elD]);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redibujado(dibujadoCopia);
        if(dibujadoCopia.length == dibujado.length){
            btnRe.setAttribute('disabled', "true");
        }
    }
}

function redibujado(nuevo_dib){
    //console.log(nuevo_dib);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let cont = 0;
    nuevo_dib.forEach(dib => {
        fig_d = dib.fig;
        color = dib.co;
        grosor = dib.gr;
        coord = dib.pos;
        rell = dib.r;
        let cantPuntos = coord.length - 1;
        if(!mover){
            for(i=0; i<cantPuntos+1; i++){
                drawpix(coord[i].x, coord[i].y);
            }
        }else if(mover){
            if(cambiarPos){
                if(cont==posFigS){
                    guardarPos = true;
                    pixeles = [];
                    for(i=0; i<cantPuntos+1; i++){
                        drawpix((coord[i].x - difxMov), (coord[i].y - difyMov));
                    }
                    dibujadoCopia[posFigS].pos = pixeles;
                    guardarPos = false;
                    pixeles = [];
                }else{
                    for(i=0; i<cantPuntos+1; i++){
                        drawpix((coord[i].x), (coord[i].y));
                    }
                }
            }else{
                if(cont==posFigS){
                    for(i=0; i<cantPuntos+1; i++){
                        drawpix((coord[i].x - difxMov), (coord[i].y - difyMov));
                    }
                }else{
                    for(i=0; i<cantPuntos+1; i++){
                        drawpix((coord[i].x), (coord[i].y));
                    }
                }
            }
        }
        
        if(rell != 0){
            color = dib.r;
            grosor = 10;
            rellenar(cont);
        }
        cont++;
    })
}

document.addEventListener('DOMContentLoaded', (ev)=>{
    canvas = document.getElementById('maincanvas');
    btnRe = document.getElementById('rehacer');
    ctx = canvas.getContext('2d');
    canvas.width = 1360;
    canvas.height = 539;
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', moviendo);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('click', seleccion);
    ctx.lineCap = 'round'; //butt, round
    ctx.lineWidth = 1;
});

const start = function(ev){
    puntos[0] = ev.offsetX;
    puntos[1] = ev.offsetY;
    //redibujado(dibujadoCopia);
    if(figura==0){
        color = colorPrevio;
        dibujando=true;
        previo = false;
        var Posicion = {x:puntos[0] ,y:puntos[1]}
        pixeles.push(Posicion);
    }else if(!select){
        previo = true;
    }else if(encontrado){
        guardarPos = false;
        compSelect(posFigS);
        difxMov = 0;
        difyMov = 0;
        compSelectEsc();
    }
}

const moviendo = function(ev){
    //previo=false;
    if(previo == true){
        redibujado(dibujadoCopia);
        puntos[2] = ev.offsetX;
        puntos[3] = ev.offsetY;
        guardarPos = false;
        if (escalar){
            dibujadoCopia[posFigSAux].pos = [];
            let difxE = puntos[2] - esc1.x;
            let difyE = puntos[3] - esc1.y;
            let figuraE = dibujadoCopia[posFigSAux];

            //console.log(color);
            puntos[0] = figuraE.ini.x1;
            puntos[1] = figuraE.ini.y1;
            figura = figuraE.fig;
            if(figura == 2 || figura ==3){
                if(difxE<difyE){
                    difyE = difxE;
                }else{
                    difxE = difyE;
                }
            }
            puntos[2] = figuraE.ini.x2 + difxE;
            puntos[3] = figuraE.ini.y2 + difyE;
            pixeles = new Array();
            redibujado(dibujadoCopia);
        }
        if(escalar){
            color = dibujadoCopia[posFigSAux].co;
            grosor = dibujadoCopia[posFigSAux].gr;
        }else{
            color = colorPrevio;
            grosor = grosorPrevio;
        }
        if (figura == 1)
        {
            dibujar_linea(puntos[0], puntos[1], puntos[2], puntos[3]);    
        }
        //-------------Circulo-------------
        else if (figura == 2)
        { 
            datosCircle(puntos[0], puntos[1], puntos[2], puntos[3]);
        }
        //-------------Elipse-------------
        else if(figura == 3){

        }
        else if(figura == 4){
            guardarPos = true;
            pixeles = new Array();
            poligono();
            guardarPos = false;
        }

    } else if(dibujando==true){  //Lapiz
        guardarPos = true;
        dibujar_linea(puntos[0], puntos[1], ev.offsetX, ev.offsetY);
        puntos[0] = ev.offsetX;
        puntos[1] = ev.offsetY;
    }else if(mover){
        puntos[2] = ev.offsetX;
        puntos[3] = ev.offsetY;
        difxMov = puntos[0] - puntos[2];
        difyMov = puntos[1] - puntos[3];
        //inicial = {x1:puntos[0], y1:puntos[1], x2:puntos[2], y2:puntos[3]}
        redibujado(dibujadoCopia);
    }

}

const end = function(ev){
    previo = false;
    //let inicial ={};
    if(!escalar){
        puntos[2] = ev.offsetX;
        puntos[3] = ev.offsetY;
        inicial = {x1:puntos[0], y1:puntos[1], x2:puntos[2], y2:puntos[3]}
    }else{
        pixeles = new Array();
    }

    //-------------Lapiz-------------
    if(figura == 0){    
        dibujando = false;
        guardarPos = true;
        dibujar_linea(puntos[0], puntos[1], puntos[2], puntos[3]);
    }
    //-------------Linea-------------
    else if(figura == 1)
    {
        guardarPos = true;
        dibujar_linea(puntos[0], puntos[1], puntos[2], puntos[3]);    
    }
    //-------------Circulo-------------
    else if (figura == 2)
    { 
        guardarPos = true;
        datosCircle(puntos[0], puntos[1], puntos[2], puntos[3]);
    }
    //-------------Elipse-------------
    else if(figura == 3){

    }
    else if(figura == 4){
        guardarPos = true;
        poligono();
        //console.log(dibujadoCopia);
    }

    if(mover){
        puntos[2] = ev.offsetX;
        puntos[3] = ev.offsetY;
        difxMov = puntos[0] - puntos[2];
        difyMov = puntos[1] - puntos[3];
        let nPosIni = dibujadoCopia[posFigS].ini;
        nPosIni.x1 = nPosIni.x1 - difxMov;
        nPosIni.y1 = nPosIni.y1 - difyMov;
        nPosIni.x2 = nPosIni.x2 - difxMov;
        nPosIni.y2 = nPosIni.y2 - difyMov;
        inicial = {x1:nPosIni.x1, y1:nPosIni.y1, x2:nPosIni.x2, y2:nPosIni.y2};
        dibujadoCopia[posFigS].ini = inicial;
        var Figura_lienzo = {pos:pixeles, co:color, gr:grosor, fig:figura, ini:inicial};
        pixeles = new Array();
        cambiarPos = true;
        redibujado(dibujadoCopia);
        cambiarPos = false
    }
    mover = false;

    if(!select){
        var Figura_lienzo = {pos:pixeles, co:color, gr:grosor, fig:figura, ini:inicial, r:0};
        //console.log("Dibujado:");
        //console.log(Figura_lienzo);
        dibujado = dibujadoCopia.slice();
        dibujado.push(Figura_lienzo);
        dibujadoCopia.push(Figura_lienzo);
        //Deshabilitar botón de Rehacer
        desH = false;
        btnRe.setAttribute('disabled', "true");
        pixeles = new Array();
        guardarPos = false;
        posFigSAux = null;
    }
    if(escalar){
        inicial = {x1:puntos[0], y1:puntos[1], x2:puntos[2], y2:puntos[3]}
        dibujadoCopia[posFigSAux].pos = pixeles;
        dibujadoCopia[posFigSAux].ini = inicial;
        //console.log(dibujadoCopia);
        escalar = null;
        posFigSAux = null;
        pixeles = new Array();
    }

}

const seleccion = function(ev){
    encontrado = false;
    if(select){
        puntos[0] = ev.offsetX;
        puntos[1] = ev.offsetY;
        var cantF = dibujadoCopia.length;
        for(i=cantF; i>0; i--){
            let totalP = dibujadoCopia[i-1].pos.length; 
            for(j=0; j<totalP; j++){
                let xBusq = dibujadoCopia[i-1].pos[j].x;
                let yBusq = dibujadoCopia[i-1].pos[j].y;
                if((puntos[0] >= xBusq-3) && (puntos[0] <= xBusq+3) && (puntos[1] >= yBusq-3) && (puntos[1] <= yBusq+3)){
                    btnElim.removeAttribute("disabled");
                    encontrado = true;
                    break;
                }
            }
            if(encontrado){
                posFigS = i-1;
                posFigSAux = posFigS;
                contornoSelect();
                break;
            }
        }
        if(!encontrado){
            redibujado(dibujadoCopia);
        }
    }
}

function contornoSelect(){
    redibujado(dibujadoCopia);
    let ext = vertices(null);
    guardarPos = false;
    color = 'red';
    grosor = 2;
    //Izq superior
    dibujar_linea(ext.xMen-10, ext.yMen-10,ext.xMen, ext.yMen-10);
    dibujar_linea(ext.xMen-10, ext.yMen-10,ext.xMen-10, ext.yMen);
    //Derecha inferior
    dibujar_linea(ext.xMay+10, ext.yMay+10,ext.xMay, ext.yMay+10);
    dibujar_linea(ext.xMay+10, ext.yMay+10,ext.xMay+10, ext.yMay);
    //Derecha superior
    dibujar_linea(ext.xMay+10, ext.yMen-10,ext.xMay+10, ext.yMen);
    dibujar_linea(ext.xMay+10, ext.yMen-10,ext.xMay, ext.yMen-10);
    //Izq inferior
    dibujar_linea(ext.xMen-10, ext.yMay+10,ext.xMen-10, ext.yMay);
    dibujar_linea(ext.xMen-10, ext.yMay+10,ext.xMen, ext.yMay+10);
    
    color = 'black';
    grosor=1;
    dibujar_linea(ext.xMen-16, ext.yMen-16,ext.xMen-16, ext.yMen-5);
    dibujar_linea(ext.xMen-16, ext.yMen-16,ext.xMen-5, ext.yMen-16);
    //derecha inferior Negro
    dibujar_linea(ext.xMay+16, ext.yMay+16,ext.xMay+6, ext.yMay+16);
    dibujar_linea(ext.xMay+16, ext.yMay+16,ext.xMay+16, ext.yMay+6);

    //color = 'blue';
    escSup = {x1: ext.xMen-16, x2:ext.xMen-5, y1:ext.yMen-16, y2:ext.yMen-5};
    escInf = {x1: ext.xMay+16, x2:ext.xMay+5, y1:ext.yMay+16, y2:ext.yMay+5};

    //dibujar_linea(escSup.x1,escSup.y1,escSup.x2,escSup.y2);
    //dibujar_linea(escInf.x1,escInf.y1,escInf.x2,escInf.y2);  
}

function compSelect(numFig){
    let totalP = dibujadoCopia[numFig].pos.length; 
    for(j=0; j<totalP; j++){
        let xBusq = dibujadoCopia[numFig].pos[j].x;
        let yBusq = dibujadoCopia[numFig].pos[j].y;
        if((puntos[0] >= xBusq-3) && (puntos[0] <= xBusq+3) && (puntos[1] >= yBusq-3) && (puntos[1] <= yBusq+3)){
            mover = true;
            posAr = {x:puntos[0], y:puntos[1]};
            break;
        }
    }
}

function rellenar(numF){
    if(numF == null){
        pixRe = dibujadoCopia[posFigS].pos;
        ext = vertices(null);
    }else{
        pixRe = dibujadoCopia[numF].pos;
        ext = vertices(numF);
    }
    
    row = ext.xMay-ext.xMen;
    column = ext.yMay-ext.yMen;
    cuaRe = [];

    for(let i=0; i<row+1; i++){
        cuaRe[i] = [];
        cuaRe[i] = new Array(column);
        cuaRe[i].fill(0);
    }

    for(i=0;i<pixRe.length;i++){
        let xT = pixRe[i].x - ext.xMen;
        let yT = pixRe[i].y - ext.yMen;
        cuaRe[xT][yT] = 1;
    }

    xCentro = Math.round((((ext.xMay - ext.xMen) / 2) + ext.xMen)-ext.xMen);
    yCentro = Math.round((((ext.yMay - ext.yMen) / 2) + ext.yMen)-ext.yMen);
    if(numF == null){
        dibujadoCopia[posFigS].r = colorRelleno;
        color = colorRelleno;
    }

    relleno(xCentro, yCentro);
    //color = colorPrevio;
    pixRe = null;
    ext = null;
}

function relleno(x, y){
    grosor = 10;
    colaD = [];
    puntoD = {x:x, y:y};
    colaD.push(puntoD);
    while(colaD.length > 0){
        elim = colaD.pop();
        x = elim.x;
        y = elim.y;
        if(cuaRe[x][y] == 0){
            drawpix(x+ext.xMen, y+ext.yMen);
            cuaRe[x][y]=1;
            colaD.push({x:x+1, y:y});
            colaD.push({x:x, y:y+1});
            colaD.push({x:x-1, y:y});
            colaD.push({x:x, y:y-1});
        }
    }
}

function cambiarRelleno(cR){
    colorRelleno = cR;
    if(posFigS!=0 && (dibujadoCopia[posFigS].r != null)){
    }
}

function sinRelleno(){
    if(select && (posFigS != null)){
        //dibujadoCopia[posFigS].r = null;
        //redibujado(dibujadoCopia);
    }
}

function vertices(posF){
    if(posF == null){
        var pix = dibujadoCopia[posFigS].pos;
    }else{
        var pix = dibujadoCopia[posF].pos;
    }
    let xmayor = pix[0].x;
    let ymayor = pix[0].y;
    let xmenor = pix[0].x;
    let ymenor = pix[0].y;
    for(i=1; i<pix.length; i++){
        if(pix[i].x > xmayor){
            xmayor = pix[i].x;
        }else if(pix[i].x < xmenor){
            xmenor = pix[i].x;
        }

        if(pix[i].y > ymayor){
            ymayor = pix[i].y;
        }else if(pix[i].y < ymenor){
            ymenor = pix[i].y;
        }
    }
    return {xMen:xmenor, xMay:xmayor, yMen:ymenor, yMay:ymayor }
}

function compSelectEsc(){
    if(((puntos[0]>escInf.x2) && (puntos[1]>escInf.y2)) && ((puntos[0] < escInf.x1) && (puntos[1] < escInf.y1))){
        console.log("Escalar");
        esc1 = {x: puntos[0], y:puntos[1]}
        //console.log(esc1);
        escalar = true;
        previo = true;
    }
}

function eliminarFig(){
    if(encontrado){
        dibujado = dibujadoCopia.slice();
        dibujadoCopia.splice(posFigS, 1);
        redibujado(dibujadoCopia);
        btnElim.setAttribute("disabled", "true");
        posFigS = null;
    }
}

function moverAtras(){
    if(encontrado){
        if(posFigS > 0){
            let aux = dibujadoCopia[posFigS-1];
            dibujadoCopia[posFigS-1] = dibujadoCopia[posFigS]
            dibujadoCopia[posFigS] = aux;
            posFigS = posFigS-1;
            redibujado(dibujadoCopia);
        }
    }
}

function moverAdelante(){
    if(encontrado){
        if(posFigS < (dibujadoCopia.length-1)){
            let aux = dibujadoCopia[posFigS+1];
            dibujadoCopia[posFigS+1] = dibujadoCopia[posFigS]
            dibujadoCopia[posFigS] = aux;
            posFigS = posFigS+1;
            redibujado(dibujadoCopia);
        }
    }
}

function lapiz(x,y){
    ctx.beginPath();
    ctx.dibujar_linea(x, y);
    ctx.strokeStyle= color;
    ctx.lineWidth = grosor;
    ctx.lineCap = 'round';
    ctx.stroke();
}  

function drawpix(x,y){
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.closePath();
    ctx.strokeStyle= color;
    ctx.lineWidth = grosor;
    ctx.lineCap = 'round';
    ctx.stroke();
    if(guardarPos){
        var Posicion = {x:x, y:y};
        pixeles.push(Posicion);
    }
}

let dibujar_linea = (x1, y1, x2, y2) => {    // Iterators, counters required by algorithm
    let x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;    // Calculate line deltas
    dx = x2 - x1;
    dy = y2 - y1;    // Create a positive copy of deltas (makes iterating easier)
    dx1 = Math.abs(dx);
    dy1 = Math.abs(dy);    // Calculate error intervals for both axis
    px = 2 * dy1 - dx1;
    py = 2 * dx1 - dy1;    // The line is X-axis dominant
    if (dy1 <= dx1) {        // Line is drawn left to right
        if (dx >= 0) {
            x = x1; y = y1; xe = x2;
        }
        else {                // Line is drawn right to left (swap ends)
            x = x2; y = y2; xe = x1;
        }
        drawpix(x, y); // Draw first pixel        // Rasterize the line
        for (i = 0; x < xe; i++) {
            x = x + 1;            // Deal with octants...
            if (px < 0) {
                px = px + 2 * dy1;
            } else {
                if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                    y = y + 1;
                } else {
                    y = y - 1;
                }
                px = px + 2 * (dy1 - dx1);
            }            // Draw pixel from line span at
                        // currently rasterized position
            drawpix(x, y);
        }
    } else { // The line is Y-axis dominant        // Line is drawn bottom to top
        if (dy >= 0) {
            x = x1; y = y1; ye = y2;
        } else { // Line is drawn top to bottom
            x = x2; y = y2; ye = y1;
        }
        drawpix(x, y); // Draw first pixel        // Rasterize the line
        for (i = 0; y < ye; i++) {
            y = y + 1;            // Deal with octants...
            if (py <= 0) {
                py = py + 2 * dx1;
            } else {
                if ((dx < 0 && dy<0) || (dx > 0 && dy > 0)) {
                    x = x + 1;
                } else {
                    x = x - 1;
                }
                py = py + 2 * (dx1 - dy1);
            }            // Draw pixel from line span at
                         // currently rasterized position
            drawpix(x, y);
        }
    }
    cont++;
}


//-----------------CIRCULO
function datosCircle(x1, y1, x2, y2){
    radio=(x2-x1)/2;
    radio2=(y2-y1)/2;
    if(radio>=radio2){
        radio=radio;
    }else{
        radio=radio2;
    }
    x0=(x1+x2)/2;
    y0=(y1+y2)/2;
    circleMidPoint(x0,y0,radio);
}

function circleMidPoint(xCenter, yCenter, radius) {
    if(radius <= 0) return;
    let x = 0,
      y = radius,
      p = 1 - radius;
  
    // Plot first set of points
    circlePlotPoints(xCenter, yCenter, x, y);
    while(x <= y) {
      x++;
      if(p < 0) // Mid point is inside therefore y remains same
        p += 2 * x + 1;
      else { // Mid point is outside the circle so y decreases
        y--;
        p += 2 * (x - y) + 1;
      }
      circlePlotPoints(xCenter, yCenter, x, y);
    }

    function circlePlotPoints() {
        x = Math.round(x);
        y = Math.round(y);
        xCenter = Math.round(xCenter);
        yCenter = Math.round(yCenter);
        drawpix(xCenter + x, yCenter + y);
        drawpix(xCenter + y, yCenter + x);
    
        drawpix(xCenter - x, yCenter + y);
        drawpix(xCenter - y, yCenter + x);
    
        drawpix(xCenter + x, yCenter - y);
        drawpix(xCenter + y, yCenter - x);
    
        drawpix(xCenter - x, yCenter - y);
        drawpix(xCenter - y, yCenter - x);
      }
}

 ///--------------POLIGONO---------------
 const gradosARadianes = grados => (grados * Math.PI)/180.0;  
 function poligono(){
    if(ladosP > 2){
      let cos=0, sin=0, r=0, angulo=0, lado=0, antx=0, anty=0;
      lado = 360/ladosP;
      r=puntos[2]-puntos[0];
      angulo=gradosARadianes(0);
      antx=Math.round((Math.cos(angulo))*r);
      anty=Math.round((Math.sin(angulo))*r);
      for(let i=lado ; i<360+lado ; i+=lado){
        angulo=gradosARadianes(i);
        cos=Math.round((Math.cos(angulo))*r);
        sin=Math.round((Math.sin(angulo))*r);
        dibujar_linea(antx+puntos[0],anty+puntos[1],cos+puntos[0],sin+puntos[1]);
        antx=cos;anty=sin;
      }
    }
}

 ///--------------DESCARGA---------------
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}