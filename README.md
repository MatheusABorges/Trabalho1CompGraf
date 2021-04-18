# Trabalho1CompGraf
-Utilizei produto interno para fazer os testes de intersceção nos polígonos.

-Optei por implementar a rasterização de círculos utilizando triangulação, dessa forma,
caso queira alterar o número de triângulos em que o círculo será dividido, basta alterar
a constante trianglesNumber. O valor 30 me pareceu funcionar bem e valores mais altos
não dão um resultado bom.

-Devido a erros de float, alguns valores obtidos a partir da triangulação de círculos 
são arredondados durante a execução do programa, pois caso contrário o resultado obtido
não é correto.
