// example = "55 16 37 92 00 30 01 00 00 00 00 00 00 00 00 00";
var cpu = {

	step: function () {
		function setState(nextState, stageName, description) {

			description = description.replace(/\*(.*?)\*/g, function (match, contents) {
				return '<span class="hint_name">' + contents + '</span>';
			});
			cpu.showHint('<span class="fetch_decode_execute ' + stageName.toLowerCase() + '">' + stageName + '</span>' + description);
			cpu.state = nextState;
		}
		switch (cpu.state) {

			case 0:
				setState(1, "Fetch", "La *Unidad de Control* copia el valor del registro *Contador de Programa* al *Registro de Dirección de Memoria* y al *Bus de Dirección*");
				cpu.registers.mar = cpu.registers.pc;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_pc,#reg_mar').addClass('active');
				$('.current_instruction').removeClass('current_instruction');
				$('#ram_address_' + cpu.registers.pc).addClass('current_instruction');
				break;
			case 1:
				setState(2, "Fetch", "La *Unidad de Control* le dice al almacén de memoria que busque la dirección en el *Bus de Direcciones* y cargue el valor almacenado allí en el *Bus de Datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;

			case 2:
				setState(3, "Fetch", "La *Unidad de Control* almacena el valor del *Bus de Datos* en el *Registro de Datos de Memoria*");
				cpu.registers.mdr = cpu.ram[cpu.registers.mar];
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mdr').addClass('active');
				break;

			case 3:
				setState(4, "Fetch", "La *Unidad de Control* copia el valor del *Registro de Datos de Memoria* en el *Registro de Instrucción Actual*");
				cpu.registers.cir = cpu.registers.mdr;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mdr,#reg_cir').addClass('active');
				break;

			case 4:
				setState(5, "Fetch", "La *unidad de control* incrementa el *contador de programas*");
				cpu.registers.pc++;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_pc').addClass('active');
				break;


			case 5:
				setState(6, "Decode", "La *unidad de decode* descompone el valor del *registro de instrucción actual* en el *código de operación* y el *operando*");
				$('.active').removeClass('active');
				$('#reg_cir,.decode_unit table').addClass('active');
				break;

			case 6:
				var opcode = ((cpu.registers.cir & 0xff) >> 4);
				$('.active').removeClass('active');
				$('.decode_row_' + opcode).addClass('active');
				switch (opcode) {
					case 0:
						setState(7, "Decode", "El *opcode* 0000 significa terminar el programa");
						break;

					case 1:
						setState(8, "Decode", "El *código de operación* 0001 significa añadir el valor del registro *Acumulador* a los datos almacenados en la memoria en la dirección especificada por el *operando*");
						break;

					case 2:
						setState(9, "Decode", "El *código de operación* 0010 significa restar el valor almacenado en memoria en la dirección especificada por el *operando* del valor del registro *acumulador*");
						break;

					case 3:
						setState(10, "Decode", "El *código de operación* 0011 significa almacenar el valor del registro *Acumulador* en la memoria en la dirección especificada por el *operando*");
						break;

					case 5:
						setState(11, "Decode", "El *código de operación* 0101 significa cargar el valor de la memoria (en la dirección especificada por el *operando*) en el registro *Acumulador*");
						break;

					case 6:
						setState(12, "Decode", "El *código de operación* 0110 significa ramificación (incondicional)");
						break;

					case 7:
						setState(13, "Decode", "El *opcode* 0111 significa bifurcarse si el *Acumulador* almacena un valor igual a 0");
						break;

					case 8:
						setState(14, "Decode", "El *opcode* 1000 significa bifurcarse si el *Acumulador* almacena un valor mayor o igual a 0 (no negativo)");
						break;

					case 9:
						setState(15, "Decode", "El *código de operación* 1001 significa entrada o salida, dependiendo del *operando*");
						break;


				}
				break;

			case 7:
				setState(7, "Execute", "La CPU se ha detenido por lo que la *Unidad de Control* no busca más instrucciones");
				$('.active').removeClass('active');
				cpu.running = false;
				break;

			case 8: //The *opcode* 0001 means add the value in the *Accumulator* register to the data stored in memory at the address specified by the *operand*"
				setState(81, "Decode", "La *Unidad de Descodificación* envía el *código de operación* al *Registro de Direcciones de Memoria* que se copia en el *Bus de Direcciones*");
				cpu.registers.mar = cpu.registers.cir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mar,.decode_row_1').addClass('active');
				break;

			case 81:
				setState(82, "Execute", "La *Unidad de Control* le dice al almacén de memoria que busque la dirección en el *Bus de Direcciones* y coloque ese valor en el *Bus de Datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;
			case 82:
				setState(83, "Execute", "La *Unidad de Control* copia el valor del *Bus de Datos* en el *Registro de Datos de Memoria*");
				cpu.registers.mdr = cpu.ram[cpu.registers.mar];
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mdr').addClass('active');
				break;
			case 83:
				setState(0, "Execute", "El *código de operación* y la *unidad de control* indican a la *unidad lógica aritmética* que sume los valores almacenados en el *acumulador* y en el *registro de datos de memoria*. El resultado se guarda de nuevo en el registro *Acumulador*");
				cpu.registers.acc += cpu.registers.mdr;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mdr,#alu,#acc').addClass('active');
				break;


			case 9: //"The *opcode* 0010 means subtract the value stored in memory at the address specified by the *operand* from the value in the *Accumulator* register"
				setState(91, "Decode", "La *Unidad de Descodificación* envía el *código de operación* al *Registro de Direcciones de Memoria* que se copia en el *Bus de Direcciones*");
				cpu.registers.mar = cpu.registers.cir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mar').addClass('active');
				break;

			case 91:
				setState(92, "Execute", "La *Unidad de Control* le dice al almacén de memoria que busque la dirección en el *Bus de Direcciones* y coloque ese valor en el *Bus de Datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;
			case 92:
				setState(93, "Execute", "La *Unidad de Control* copia el valor del *Bus de Datos* en el *Registro de Datos de Memoria*");
				$('.active').removeClass('active');
				$('#reg_mdr').addClass('active');
				cpu.registers.mdr = cpu.ram[cpu.registers.mar];
				cpu.updateValues();
				break;
			case 93:
				setState(0, "Execute", "El *código de operación* y la *Unidad de Control* indican a la *Unidad Lógica Aritmética* que reste los valores almacenados en el *Registro de Datos de Memoria* del valor almacenado en el registro del *Acumulador*. El resultado se guarda de nuevo en el registro *Acumulador*");
				cpu.registers.acc = cpu.registers.acc - cpu.registers.mdr;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#alu,#reg_acc,#reg_mdr').addClass('active');
				break;



			case 10: //"The *opcode* 0011 means store the value in the *Accumulator* register into memory at the address specified by the *operand*"
				setState(101, "Decode", "El *código de operación* y la *unidad de control* envían el valor almacenado en el registro *acumulador* al *registro de datos de memoria* que se copia en el *bus de datos*");
				cpu.registers.mdr = cpu.registers.acc;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_acc,#reg_mdr').addClass('active');
				break;
			case 101:
				setState(102, "Decode", "La *Unidad de Descodificación* envía el *operando* al *Registro de Direcciones de Memoria* que se copia en el *Bus de Direcciones*");
				cpu.registers.mar = cpu.registers.cir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mar').addClass('active');
				break;
			case 102:
				setState(0, "Execute", "La *Unidad de Control* le dice al almacén de memoria que guarde el valor del *Bus de Datos* en la dirección del *Bus de Direcciones*");
				cpu.ram[cpu.registers.mar] = cpu.registers.mdr;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;

			case 11: //"The *opcode* 0101 means load the value from memory (at the address specified by the *operand*) into the *Accumulator* register"
				setState(111, "Decode", "La *Unidad de Descodificación* envía el *operando* al *Registro de Direcciones de Memoria* que se copia en el *Bus de Direcciones*");
				cpu.registers.mar = cpu.registers.cir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mar').addClass('active');
				break;

			case 111:
				setState(112, "Execute", "La *Unidad de Control* le dice al almacén de memoria que busque la dirección en el *Bus de Direcciones* y coloque ese valor en el *Bus de Datos*");
				$('.active').removeClass('active');
				$('#ram_value_' + cpu.registers.mar).addClass('active');
				break;
			case 112:
				setState(113, "Execute", "La *Unidad de Control* copia el valor del *Bus de Datos* en el *Registro de Datos de Memoria*");
				cpu.registers.mdr = cpu.ram[cpu.registers.mar];
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mdr').addClass('active');
				break;
			case 113:
				setState(20, "Execute", "El *código de operación* y la *unidad de control* envían el valor del *registro de datos de memoria* al registro del *acumulador*");
				cpu.registers.acc = cpu.registers.mdr;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_mdr,#reg_acc').addClass('active');
				break;

			case 12://The *opcode* 0110 means branch (unconditionally)
				setState(20, "Execute", "El *operand* se almacena en el *contador de programa*");
				cpu.registers.pc = cpu.registers.cir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_pc').addClass('active');
				break;

			case 13://The *opcode* 0111 means branch if the *Accumulator* stores a value equal to 0
				setState(20, "Execute", "La *Unidad de Control* y el *código de operación* hacen que la *Unidad Lógica Aritmética* compruebe si el registro *Cumulador* contiene un cero. Si lo contiene, el *operando* se copia en el registro *Contador de Programa*");
				if (cpu.registers.acc == 0)
					cpu.registers.pc = cpu.registers.cir & 0x0F;
				cpu.updateValues();
				$('.active').removeClass('active');
				$('#reg_acc,#reg_pc,#alu').addClass('active');
				break;

			case 14://The *opcode* 1000 means branch if the *Accumulator* stores a value greater than or equal to 0"
				setState(20, "Execute", "La *Unidad de Control* y el *código de operación* hacen que la *Unidad Lógica Aritmética* compruebe si el registro *Cumulador* contiene un valor mayor que cero. Si lo contiene, el *operando* se copia en el registro *Contador de Programa*");
				if (cpu.registers.acc >= 0)
					cpu.registers.pc = cpu.registers.cir & 0x0F;
				$('.active').removeClass('active');
				cpu.updateValues();
				$('#alu,#reg_acc,#reg_pc').addClass('active');
				break;

			case 15://The *opcode* 1001 means either input or output, depending on the *operand*"
				if ((cpu.registers.cir & 0x0F) == 1) {
					setState(20, "Execute", "El *código de operación* 0001 y el *Bus de control* lee del dispositivo de entrada y coloca el valor de entrada en el registro *Acumulador*");
					cpu.registers.acc = parseInt(prompt("Enter decimal input value:")) & 0xFF;
					cpu.updateValues();
					$('.active').removeClass('active');
					$('#reg_acc').addClass('active');
				}
				if ((cpu.registers.cir & 0x0F) == 2) {
					setState(20, "Execute", "El *código de operación* 0010 y el *Bus de control* hace que se envíe el valor del registro *Acumulador* al dispositivo de salida");
					alert("Output: " + cpu.registers.acc);
					$('.active').removeClass('active');
					$('#reg_acc').addClass('active');
				}
				break;

			case 20:
				setState(0, "Execute", "La *Unidad de Control* comprueba si hay interrupciones y se bifurca a la rutina de servicio de interrupción correspondiente o comienza el ciclo de nuevo");
				break;


		}
		if (cpu.running) {
			cpu.nextTimeout = setTimeout(cpu.step, cpu.runDelay);
		}
	},

	state: 0,

	running: false,

	nextTimeout: 0,

	runDelay: 1000,

	showHint: function (html) {
		$('#hint_text').html(html);
	},

	jqCPU: null,

	ram: [],

	pad: function (val, length) {
		while (val.length < length) {
			val = "0" + val;
		}
		return val;
	},

	hex2bin: function (hex) {
		var v = parseInt(hex, 16) & 0xFF;
		return cpu.pad(v.toString(2), 8);
	},

	bin2hex: function (bin) {
		var v = parseInt(bin, 2) & 0xFF;
		return cpu.pad(v.toString(16), 2);
	},

	bin2dec: function (bin) {
		var v = parseInt(bin, 2) & 0xFF;
		if (v >= 128)
			v -= 256;
		return v;
	},

	dec2bin: function (dec) {
		return cpu.pad((dec & 0xFF).toString(2), 8);
	},

	hex2dec: function (hex) {
		var v = parseInt(hex, 16) & 0xFF;
		if (v >= 128)
			v -= 256;
		return v;
	},

	dec2hex: function (dec) {
		return cpu.pad((dec & 0xFF).toString(16), 2);
	},

	updateValues: function () {
		var regNames = Object.keys(cpu.registers);

		function writeValue(val, jqDest) {
			if (jqDest.hasClass("value_binary")) {
				val = cpu.dec2bin(val);
			}
			if (jqDest.hasClass("value_hex")) {
				val = cpu.dec2hex(val);
			}
			jqDest.text(val);
		}

		for (var i = 0; i < regNames.length; i++) {
			var val = cpu.registers[regNames[i]];
			var jqDest = $('#reg_' + regNames[i] + "_val");
			writeValue(val, jqDest);
		}

		for (var i = 0; i < cpu.ram.length; i++) {
			writeValue(cpu.ram[i], $('#ram_value_' + i));
		}
	},

	registers: {
		acc: 0,
		pc: 0,
		mar: 0,
		mdr: 0,
		cir: 0
	},

	updateAnnotations: function () {
		var d = $('#drawing').html("");
		var w = d.width();
		var h = d.height();
		var paper = Raphael("drawing", w, h);
		paper.clear();

		function connect(from, to, attributes, label, labelAttributes) {

			function getX(i, a) {
				switch (a) {
					case 'left':
						return i.position().left;
						break;
					case 'right':
						return i.position().left + i.outerWidth(true);
						break;
					case 'middle':
						return i.position().left + (i.outerWidth(true) / 2);
						break;
					default:
						var percentage = parseInt(a.replace("%", ""));
						return i.position().left + (i.outerWidth(true) * percentage / 100);
						break;
				}
			}

			function getY(i, a) {
				switch (a) {
					case 'top':
						return i.position().top;
						break;
					case 'bottom':
						return i.position().top + i.outerHeight(true);
						break;
					case 'middle':
						return i.position().top + (i.outerHeight(true) / 2);
						break;
					default:
						var percentage = parseInt(a.replace("%", ""));
						return i.position().top + (i.outerHeight(true) * percentage / 100);
				}
			}
			var x1 = getX(from.e, from.h);
			var x2 = x1;
			if (to.h) {
				x2 = getX(to.e, to.h);
			}

			var y1 = getY(from.e, from.v);
			var y2 = y1;
			if (to.v) {
				y2 = getY(to.e, to.v);
			}

			var e = paper.path("M" + Math.floor(x1) + " " + Math.floor(y1) + "L" + Math.floor(x2) + " " + Math.floor(y2));
			if (attributes === undefined) {
				attributes = { "stroke-width": 10, "arrow-end": "block-narrow-short" };
			}
			e.attr(attributes);

			if (label) {
				var x = Math.floor((x1 + x2) / 2);
				var y = Math.floor((y1 + y2) / 2);
				var text = paper.text(x, y, label);
				if (labelAttributes) {
					text.attr(labelAttributes);
				}
			}
		}

		var PC = $('#reg_pc');
		var MAR = $('#reg_mar');
		var decodeUnit = $('.decode_unit');
		var MDR = $('#reg_mdr');
		var CIR = $('#reg_cir');
		var ALU = $('#alu');
		var ACC = $('#reg_acc');
		var CPU = $('.cpu');
		var RAM = $('.ram');

		connect({ e: ALU, h: "left", v: "middle" }, { e: decodeUnit, h: "right" }, { "stroke-width": 10, "arrow-start": "block-narrow-short" });
		connect({ e: PC, h: "right", v: "middle" }, { e: MAR, h: "left", v: "middle" });
		connect({ e: decodeUnit, h: "60%", v: "top" }, { e: PC, v: "bottom" });
		connect({ e: decodeUnit, h: "80%", v: "top" }, { e: MAR, h: "left", v: "bottom" });
		connect({ e: MDR, h: "middle", v: "bottom" }, { e: CIR, h: "middle", v: "top" });
		connect({ e: CIR, h: "left", v: "middle" }, { e: decodeUnit, h: "right" });
		connect({ e: MDR, h: "20%", v: "top" }, { e: ALU, v: "bottom" });
		connect({ e: ACC, h: "20%", v: "bottom" }, { e: ALU, v: "top" }, { "stroke-width": 10, "arrow-end": "block-narrow-short", "arrow-start": "block-narrow-short" });
		connect({ e: MDR, h: "80%", v: "top" }, { e: ACC, h: "80%", v: "bottom" }, { "stroke-width": 10, "arrow-end": "block-narrow-short", "arrow-start": "block-narrow-short" });

		connect({ e: CPU, h: "right", v: "5%" }, { e: RAM, h: "left" }, { "stroke-width": 20, "stroke": "#F00", "arrow-end": "block-narrow-short" }, "Bus de direcciones");
		connect({ e: CPU, h: "right", v: "56%" }, { e: RAM, h: "left" }, { "stroke-width": 20, "stroke": "#F00", "arrow-end": "block-narrow-short", "arrow-start": "block-narrow-short" }, "Bus de datos");
		connect({ e: CPU, h: "right", v: "85%" }, { e: RAM, h: "left" }, { "stroke-width": 20, "stroke": "#F00", "arrow-end": "block-narrow-short", "arrow-start": "block-narrow-short" }, "Bus de control");
	},

	init: function (jqCPU) {
		$(window).resize(cpu.updateAnnotations);
		cpu.jqCPU = jqCPU;
		var html = '<div id="drawing"></div><div class="ram"><h3><i class="fa fa-list"></i> RAM</h3>';
		html += '<table class="table table-fixed table-striped table-hover"><thead><tr><th>Dirección</th><th>Valor</th></tr></thead>';
		var params = window.location.search.substr(1);
		var ram = [];
		var initZeros = true;
		if (ram = params.replace("ram=", "")) {
			if (ram = ram.match(/([0-9a-fA-F]{2})/g)) {
				initZeros = false;
			}
		}
		for (var address = 0; address < 16; address++) {
			cpu.ram[address] = initZeros ? 0 : cpu.hex2dec(ram[address]);
			html += '<tr><td id="ram_address_' + address + '" class="value value_denary">' + address + '</td><td id="ram_value_' + address + '" class="value value_denary editable" data-description="Memoria de dirección ' + address + '">' + cpu.ram[address] + '</td></tr>';
		}
		html += '</table>';
		html += '</div>';


		html += '<div class="cpu"><h3><i class="fa fa-microchip"></i> CPU</h3>';

		function getRegisterHtml(name, value, desc) {
			return '<div class="register" id="reg_' + name.toLowerCase() + '"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
		}
		html += getRegisterHtml('PC', 0, "Contador de Programa (Registro que contiene la dirección de la siguiente instrucción que se va a ejecutar)");
		html += getRegisterHtml('MAR', 0, "Registro de Direcciones de Memoria (Registro que contiene la dirección de memoria de la que se va a extraer un dato o una instrucción)");
		html += getRegisterHtml('MDR', 0, "Registro de Datos de Memoria (Registro que contiene el dato o la instrucción que	se ha extraído de memoria)");
		html += getRegisterHtml('ACC', 0, "Registro que Almacena Resultados Temporalmente (Registro que	contiene los resultados	temporales de las operaciones)");
		html += getRegisterHtml('CIR', 0, "Registro de Instrucción Actual (Registro que	contiene la	instrucción que se está ejecutando)");

		html += '<div id="alu">ALU (Unidad Aritmético-Lógica)</div>';
		html += '<div id="cu">CU (Unidad de control)</div>';


		html += '<div class="decode_unit"><h4><i class="fa fa-info-circle"></i> Unidad de decode</h2>';
		html += '<table class="table table-fixed table-striped table-hover"><thead><tr><th>Opcode</th><th>Operand</th><th>Instrucción</th></tr></thead>';
		html += '<tr class="decode_row_0"><td>0000</td><td>0000</td><td>Acabar</td></tr>';
		html += '<tr class="decode_row_1"><td>0001</td><td>dirección</td><td>Sumar</td></tr>';
		html += '<tr class="decode_row_2"><td>0010</td><td>dirección</td><td>Restar</td></tr>';
		html += '<tr class="decode_row_3"><td>0011</td><td>dirección</td><td>Almacenar</td></tr>';
		html += '<tr class="decode_row_5"><td>0101</td><td>dirección</td><td>Cargar</td></tr>';
		html += '<tr class="decode_row_6"><td>0110</td><td>dirección</td><td>Saltar Siempre</td></tr>';
		html += '<tr class="decode_row_7"><td>0111</td><td>dirección</td><td>Saltar si ACC = 0</td></tr>';
		html += '<tr class="decode_row_8"><td>1000</td><td>dirección</td><td>Saltar si ACC >= 0</td></tr>';
		html += '<tr class="decode_row_9"><td>1001</td><td>0001</td><td>Entrada</td></tr>';
		html += '<tr class="decode_row_9"><td>1001</td><td>0010</td><td>Salida</td></tr>';
		html += '</div>';

		html += '</div>';



		$(jqCPU).html(html);


		cpu.updateAnnotations();

		$('#modal_change_value').modal({ show: false })
		$('#run_speed').change(function () {
			cpu.runDelay = $(this).val();
		});

		$('#btn_reset_cpu').click(function () {
			cpu.state = 0;
			cpu.registers.acc = cpu.registers.cir = cpu.registers.mar = cpu.registers.mdr = cpu.registers.pc = 0;
			cpu.showHint("Los registros de la CPU y el estado de ejecución se ponen a cero")
			$('.current_instruction').removeClass('current_instruction');
			cpu.updateValues();
		});

		$('#btn_share').click(function () {
			$('#st-2').toggleClass('st-hidden');
		});

		setTimeout(function () {
			$('#st-2').addClass('st-hidden');
		}, 5000);

		$('#btn_reset_ram').click(function () {
			cpu.showHint("Todos los valores de la memoria se ponen a cero");
			for (var address = 0; address < 16; address++) {
				cpu.ram[address] = 0;
				var jq = $('#ram_value_' + address);
				if (jq.hasClass('value_denary')) {
					jq.text(0);
				}
				if (jq.hasClass('value_binary')) {
					jq.text("00000000");
				}
				if (jq.hasClass('value_hex')) {
					jq.text("00");
				}
			}
		});

		$('.value.editable').click(function (e) {
			var id = e.currentTarget.id;

			var jq = $('#' + id);
			$('#modal_change_value_title').text(jq.data("description"));
			$('#change_value_from').text(jq.text());
			$('#change_value_to').val(jq.text());
			cpu.lastChangedValue = id;
			$('#modal_change_value').modal('show')
		});

		$('#btn_change_value_ok').click(function () {
			function getInt(jq, val) {
				if (jq.hasClass('value_hex')) {
					return cpu.hex2dec(val);
				}
				if (jq.hasClass('value_binary')) {
					return cpu.bin2dec(val);
				}
				val = parseInt(val, 10) & 0xFF;
				return val >= 128 ? val - 256 : val;
			}

			var jq = $('#' + cpu.lastChangedValue);
			var value = $('#change_value_to').val();
			var parts = cpu.lastChangedValue.split("_");
			switch (parts[0]) {
				case 'ram':
					var address = parseInt(parts[2]);
					cpu.ram[address] = getInt(jq, value);
					break;
				case 'reg':
					var reg = parts[1];
					cpu.registers[reg] = getInt(jq, value);
					break;

			}
			cpu.updateValues();
		});

		$('#btn_step').click(cpu.step);

		$('#btn_run').click(function () {
			if (cpu.running && cpu.nextTimeout) {
				clearTimeout(cpu.nextTimeout);
			} else {
				cpu.running = true;
				cpu.step();
			}
		});

		$('#modal_change_value').on('shown.bs.modal', function () {
			$('#change_value_to').focus().select();
		});

		$('#modal_export').on('shown.bs.modal', function (e) {
			var bytes = [];
			for (var i = 0; i < cpu.ram.length; i++) {
				bytes.push(cpu.dec2hex(cpu.ram[i]));
			}
			var hex = bytes.join(" ");
			$('#export_hex').val(hex).focus().select();
		});

		$('#btn_import').click(function () {
			var bytes = $('#export_hex').val().split(" ");
			for (var i = 0; i < bytes.length && i < cpu.ram.length; i++) {
				cpu.ram[i] = cpu.hex2dec(bytes[i]);
			}
			cpu.updateValues();
		});

		$('#btn_export').click(function () {
			var bytes = $('#export_hex').val().replace(/ /g, "");
			window.location = window.location.origin + window.location.pathname + "?ram=" + bytes;
		});

		$('#btn_toggle_hint').click(function (e) {
			$('#hint').toggleClass('hint-hidden');
		});

		$('.btn_values').click(function (e) {
			var mode = e.currentTarget.id.split("_")[2];
			$('.value').each(function (index, element) {
				var jq = $(this);
				var val = jq.text();
				if (jq.hasClass("value_binary")) {
					val = parseInt(val, 2);
				}
				if (jq.hasClass("value_denary")) {
					val = parseInt(val, 10);
				}
				if (jq.hasClass("value_hex")) {
					val = parseInt(val, 16);
				}
				switch (mode) {
					case 'binary':
						jq.text(cpu.dec2bin(val));
						break
					case 'hex':
						jq.text(cpu.dec2hex(val));
						break;
					case 'denary':
						jq.text(val);
						break;


					/* ADDED FROM HERE */

					case 'denary':
						jq.text(cpu.bin2dec(val));
						break
					case 'hex':
						jq.text(cpu.bin2hex(val));
						break;
					case 'binary':
						jq.text(val);
						break;
						
					
					case 'denary':
						jq.text(cpu.hex2dec(val));
						break
					case 'binary':
						jq.text(cpu.hex2bin(val));
						break;
					case 'hex':
						jq.text(val);

					/* TO HERE */

				}
			}).removeClass("value_binary value_denary value_hex").addClass("value_" + mode);

		});

		$('#btn_values_binary').trigger("click");
	}
};
$(function () {
	cpu.init("#cpu")
});