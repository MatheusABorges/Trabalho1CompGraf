(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';


        /* ------------------------------------------------------------ */
    
    //constante que deve ser alterada para aumentar o número de triangulos usados na triangulação do círculo, deve ser no mínimo 3
    //valores muito altos pioram a imagem gerada
    const trianglesNumber = 30;


    const gapSize = (Math.PI*2)/trianglesNumber;

    //Precisei arredondar o valor da transformação caso ela seja feita em pontos do triângulo obtido a partir da triangulação de um círculo
    //Isso se deve pelo erro númerico obtido ao fazer contas com tais triângulos quebrar o programa
    //o Parâmetro isCircle indica se o ponto foi obtido a partir da triangulação de um círculo ou não
    function applyTransformation(Transformation, X, isCircle){
        let newPoint = [];
        if(!isCircle){
            newPoint.push(Transformation[0][0]*X[0] + Transformation[0][1]*X[1] + Transformation[0][2]*X[2]);
            newPoint.push(Transformation[1][0]*X[0] + Transformation[1][1]*X[1] + Transformation[1][2]*X[2]);
            newPoint.push(Transformation[2][0]*X[0] + Transformation[2][1]*X[1] + Transformation[2][2]*X[2]);
        }else{
            newPoint.push(Math.round((Transformation[0][0]*X[0] + Transformation[0][1]*X[1] + Transformation[0][2]*X[2])));
            newPoint.push(Math.round((Transformation[1][0]*X[0] + Transformation[1][1]*X[1] + Transformation[1][2]*X[2])));
            newPoint.push(Math.round((Transformation[2][0]*X[0] + Transformation[2][1]*X[1] + Transformation[2][2]*X[2])));
        }
        return newPoint;
    }

    //Aplica a transformação afim informada em todos os pontos da lista de pontos informada
    function transform(Points, Transformation, isCircle){
        let newPoints = [];
        for(var point of Points){
            point.push(1);
            var aux = applyTransformation(Transformation, point, isCircle);
            aux.pop();
            newPoints.push(aux);
        }
        return newPoints;
    }

    function dotProduct(X, Y){
        let product = 0;
        if(X.length != Y.length){
            return;
        }
        for(let i=0;i<X.length;i++){
            product += X[i] * Y[i];
        }
        return (product);
    }

    //subtrai 2 pontos para gerar um vetor
    function generateVector(X , Y){
        let value = [];
        value[0] = (X[0] - Y[0]);
        value[1] = (X[1] - Y[1]);
        return value;
    }

    //"rotaciona" um vetor 90 graus para achar o vetor normal a ele
    function rotate(X){
        var aux = [];
        aux[0] = (X[1]*-1);
        aux[1] = (X[0]);
        return aux;
    }

    //retorna o valor do produto escalar entre o vetor (Ponto1 - [x,y]) com o vetor (Ponto2 - Ponto)
    function comparePolygon(Ponto1, Ponto2, x, y, primitive){
        var ponto = [];
        ponto[0] = x;
        ponto[1] = y;
        var normal = rotate(generateVector(Ponto2, Ponto1));
        var aux = generateVector(ponto, Ponto1);
        return dotProduct(aux, normal);
    }

    //determina se um dado ponto está dentro do polígono
    //como não controlo a orientação do polígono informado, calculo o valor de um ponto contido no polígono (ponto guardado na
    //variavel "aux" e é um dos vértices do polígono) e realizo parte do teste de intersceção nesse ponto e verifico o sinal do resultado
    //obtido, esse sinal me informa a orientação do polígono e está guardado na variavel a
    function insidePolygon(x, y, primitive){
        let aux = [];
        aux[0] = primitive.vertices[2][0];
        aux[1] = primitive.vertices[2][1];
        let a = comparePolygon(primitive.vertices[1], primitive.vertices[0], aux[0], aux[1], primitive);
        for(let i = 1; i<primitive.vertices.length; i++){
            if(comparePolygon(primitive.vertices[i-1], primitive.vertices[i], x, y, primitive)*(a) > 0){
                return false;
            }
        }
        if(comparePolygon(primitive.vertices[primitive.vertices.length-1], primitive.vertices[0], x, y, primitive)*(a) > 0){
            return false
        }
        return true;
    }
    //Precisei arredondar os valores dos pontos do triângulo, pois caso contrário os erros de float fazem o programa quebrar
    function trianglePoints(Circle, i){
        let point = []
        let X = Circle.radius*Math.cos(i) + Circle.center[0];
        let Y = Circle.radius*Math.sin(i) + Circle.center[1];
        point.push(Math.round(X));
        point.push(Math.round(Y));
        return point;
    }

    //Função que faz a triangulação dos círculos da cena
    function triangulation(Circle){
        let aux = [];
        for(let i=0; i<Math.PI*2; i+=gapSize){
            let scene = {};
            scene.shape = "triangle";
            scene.color = Circle.color;
            scene.vertices = [];
            if(Circle.hasOwnProperty("xform")){
                scene.xform = Circle.xform;
            }
            scene.vertices.push(Circle.center);
            scene.vertices.push(trianglePoints(Circle, i));
            scene.vertices.push(trianglePoints(Circle, i+gapSize));
            aux.push(scene);
        }
        return aux;
    }

    //os valores extremos são: x min, x max, y min , y max, respectivamente
    function createBoundBox(Points){
        let extremeValues = [];
        extremeValues[0] = Points[0][0];
        extremeValues[1] = Points[0][0];
        extremeValues[2] = Points[0][1];
        extremeValues[3] = Points[0][1];
        for(let i=0; i<Points.length; i++){
            if(Points[i][0] < extremeValues[0]){
                extremeValues[0] = Points[i][0];
            }
            if(Points[i][0] > extremeValues[1]){
                extremeValues[1] = Points[i][0];
            }
            if(Points[i][1] < extremeValues[2]){
                extremeValues[2] = Points[i][1];
            }
            if(Points[i][1] > extremeValues[3]){
                extremeValues[3] = Points[i][1];
            }
        }
        return extremeValues;
    }

    function inside(  x, y, primitive  ) {
            if(primitive.shape == "polygon" || primitive.shape == "triangle"){
                return insidePolygon(x, y, primitive);
            }
            return false;
    }
        
    
    function Screen( width, height, scene ) {
        this.width = width;
        this.height = height;
        this.scene = this.preprocess(scene);   
        this.createImage(); 
    }

    Object.assign( Screen.prototype, {

            preprocess: function(scene) {
                // Possible preprocessing with scene primitives, for now we don't change anything
                // You may define bounding boxes, convert shapes, etc
                var preprop_scene = [];
                for( var primitive of scene ) {  
                    // do some processing
                    // for now, only copies each primitive to a new list
                    if(primitive.shape != "circle"){
                        if(primitive.hasOwnProperty("xform")){
                                primitive.vertices = transform(primitive.vertices, primitive.xform, false);
                                preprop_scene.push(primitive);
                        }else{
                            preprop_scene.push(primitive);
                        }
                    }else{
                        for(var pri of triangulation(primitive)){
                            if(pri.hasOwnProperty("xform")){
                                pri.vertices = transform(pri.vertices, pri.xform, true);
                            }
                            preprop_scene.push(pri);
                        }
                    }            
                }
                return preprop_scene;
            },

            createImage: function() {
                this.image = nj.ones([this.height, this.width, 3]).multiply(255);
            },

            rasterize: function() {
                var color;
                // In this loop, the image attribute must be updated after the rasterization procedure.
                for( var primitive of this.scene ) {
                    // Loop through all pixels
                    // Use bounding boxes in order to speed up this loop
                    var iterator = createBoundBox(primitive.vertices);
                    for (var i = iterator[0]; i < iterator[1]; i++) {
                        var x = i + 0.5;
                        for( var j = iterator[2]; j < iterator[3]; j++) {
                            var y = j + 0.5;
                            // First, we check if the pixel center is inside the primitive 
                            if ( inside( x, y, primitive ) ) {
                                // only solid colors for now
                                color = nj.array(primitive.color);
                                this.set_pixel( i, this.height - (j + 1), color );
                            }
                            
                        }
                    }
                }
                
               
              
            },

            set_pixel: function( i, j, colorarr ) {
                // We assume that every shape has solid color
         
                this.image.set(j, i, 0,    colorarr.get(0));
                this.image.set(j, i, 1,    colorarr.get(1));
                this.image.set(j, i, 2,    colorarr.get(2));
            },

            update: function () {
                // Loading HTML element
                var $image = document.getElementById('raster_image');
                $image.width = this.width; $image.height = this.height;

                // Saving the image
                nj.images.save( this.image, $image );
            }
        }
    );

    exports.Screen = Screen;
    
})));

