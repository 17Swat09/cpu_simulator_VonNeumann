# cpu_simulator_VonNeumann
 This script is an edition of the original pddring script. Original: https://github.com/pddring/cpu-simulator

# HTML5 CPU Simulator (8 bit binary implementation of Little Man Computer)

![Von Neumann CPU Simulator for OCR A Level](https://tools.withcode.uk/cpu/thumb.jpg)

## Resumen
Este proyecto es una simulación de la CPU de Little Man Computer adaptada para hacerla más adecuada a los estudiantes de OCR A Level.

## Pruébalo
Puedes ver una demostración en vivo de este proyecto aquí: [tools.withcode.uk/cpu](https://tools.withcode.uk/cpu)

## Características
Esta simulación de CPU le permite:
- Recorrer cada paso del ciclo de ejecución de la decodificación
- Ver qué registro se ve afectado por cada paso con una explicación de lo que ocurre
- Ver cómo cambian los datos en cada registro 
- Escribir y ejecutar su propio código en la CPU
- Guarde y comparta su código
- Ver y ejecutar código de ejemplo 

## Antecedentes
El modelo de CPU Little Man Computer (LMC) es una forma brillante de introducir a los estudiantes en el ciclo de obtención-decodificación-ejecución que controla el funcionamiento de una CPU.

El LMC simplifica las entrañas de una CPU a sólo tres registros:

- Acumulador: Registros de propósito general
- Contador de programa: Lleva la cuenta de la dirección de la siguiente instrucción
- Registro de instrucciones: La instrucción actual que se está ejecutando.

Para el nivel A (mis alumnos están estudiando el curso OCR), también es necesario conocer el propósito y la función de los siguientes componentes de la CPU:

- Registro de direcciones de memoria
- Registro de datos de memoria
- Unidad de control
- Unidad lógica aritmética
- Bus de datos
- Bus de control
- Bus de direcciones

Quería crear un simulador que incorporara todo lo anterior sin dejar de ser lo más sencillo posible.
El objetivo de este proyecto es explicar lo que sucede en cada etapa del ciclo de obtención, decodificación y ejecución en términos del flujo de datos entre registros y buses.

## Diferencias clave con el LMC
Una CPU Little Man Computer tiene 99 buzones (posiciones de memoria) que pueden almacenar cada uno un entero con signo entre -999 y 999.
Las instrucciones en un LMC se almacenan como números denarios de 3 dígitos donde el dígito más significativo representa la instrucción y los dos dígitos menos significativos son la dirección.

Por ejemplo, en LMC
`LDA 1` se ensambla a la orden `501`

que se descompone en:
  `5` (Cargar) desde la dirección `01` (Buzón 1)
  
Esta CPU tiene registros de 8 bits. Los 4 bits más significativos contienen el opcode y los 4 bits menos significativos son la dirección.

Por ejemplo, en esta CPU 
`10010001`

se divide en el opcode `1001` (o denario 5) y la dirección `0001` (denario 1)

Esto significa también meads Cargar desde la dirección de memoria 1

El conjunto de instrucciones se ha mantenido igual que en el Little Man Computer, pero las instrucciones están codificadas en binario en lugar de en denario.

Debido a que las direcciones sólo pueden ser almacenadas como un nibble de 4 bits, la memoria RAM está limitada a 16 posiciones. Cada una de ellas almacena valores de 8 bits.
Para poder hacer frente a los números negativos, los valores enteros de la memoria se interpretan como números de 8 bits con signo codificados con complemento a dos.

## Créditos
La estructura del procesador está basada en el diagrama del excelente [Craig'n'Dave youtube videos](https://youtu.be/OTDTdTYld2g?t=22s)
El código utiliza las siguientes bibliotecas:
- [Bootstrap](http://getbootstrap.com/) para la interfaz de usuario. Licencia MIT.
- [FontAwesome](http://fontawesome.io/) de Dave Gandy para los iconos. Licencia MIT.
- [jQuery](https://jquery.com/) para la manipulación del DOM. Licencia MIT.
- [Raphael](http://dmitrybaranovskiy.github.io/raphael/) para dibujar anotaciones. Licencia MIT.
- [ShareThis](https://www.sharethis.com/) para botones de compartir en redes sociales. (c) 2017 ShareThis

## Ver también
- [CPU Battle Tanks](https://github.com/pddring/cpu-battle-tank/wiki): Controla un tanque con una CPU de Little Man Computer
