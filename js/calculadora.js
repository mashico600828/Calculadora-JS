// JavaScript Document
var calculator = document.getElementById('calculadoraFondo');
var output = document.getElementById('display');
var signo = "+";   /* variables para control de cambio de signo swl numweo ingresado */
var signoaux = "+";

calculator.addEventListener('click', calculatorClick);

function calculatorClick(event) {
  var target = event.target;
  var dataset = target.dataset;
  var value = dataset.value;
  var type = dataset.type;

  console.log(dataset); 
  if (type) {
    calc.input(type, value, signo);
    result = calc.output(type, value, signo) ;
	cadena = "";
	digito = "";
	punto = ".";
    output.innerHTML = result;
  }
}

//  estados de los operadores
const STATE_LEFT_OPERAND = 'left_operand';
const STATE_RIGHT_OPERAND = 'right_operand';
const STATE_OPERATOR = 'operator';
const STATE_RESULT = 'result';

// tipos de entradas por teclado
const TYPE_NUMBER = 'number';
const TYPE_ACTION = 'action';
const TYPE_OPERATOR = 'operator';
const NUMBER_DIGIT = 8;     /* numero de digitos del operando o resultado */
const tecla = document.getElementById("sign"); 
/*tecla.addEventListener('click', teclaClick); */ 

// tipo de operacion
const OPERATOR_DIVISION = '/';
const OPERATOR_MULTIPLICATION = '*';
const OPERATOR_ADDITION = '+';
const OPERATOR_SUBTRACTION = '-';

// acciones de teclas o resultado

const ACTION_CLEAR = 'C';
const ACTION_SIGN = '-';
const ACTION_RESULT = '=';

class BaseStrategy {
  constructor(delegate) {
    this.delegate = delegate;
  }
  onNumber(number) {
     this.delegate.acc.push(number);
  }
  onSigno(signo){
     signo = signo;   /* guardo el signo */
  }
  onOperator(operator){}
  onResult(){
    result = 0;
    output.innerHTML = result;
  }
  onClear() {
    this.delegate.reset();
  }
}

class LeftOperandStrategy extends BaseStrategy {
  onOperator(operator){
    let dg = this.delegate;
    dg.setOperator(operator);
    dg.setLeftOperand(dg.getAccumulator());
    dg.transition(STATE_OPERATOR);
  }
}

class OperatorStrategy  extends BaseStrategy {
  onNumber(number) {
    let dg = this.delegate;
    dg.clearAccumulator();
    dg.acc.push(number);
    dg.transition(STATE_RIGHT_OPERAND);
  }
  onOperator(operator) {
    this.delegate.setOperator(operator);
  }
  onResult() {
    let dg = this.delegate;
    dg.setRightOperand(dg.getAccumulator());
    dg.setAccumulator(dg.operation());
  }
}

class RightOperandStrategy  extends BaseStrategy {
  onOperator(operator) {
    let dg = this.delegate;
    let result = 0;
    dg.setRightOperand(dg.getAccumulator());
    result = dg.operation();
    dg.setAccumulator(result);
    dg.setLeftOperand(result);
    dg.setOperator(operator);
    dg.transition(STATE_OPERATOR);
  }
  onResult() {
    let dg = this.delegate;
    let result = 0;
    let rightOperand = 0;
    dg.setRightOperand(dg.getAccumulator());
    result = dg.operation();
    dg.setAccumulator(result);
    rightOperand = dg.getRightOperand();
    if (dg.getOperator() === OPERATOR_SUBTRACTION) {
      rightOperand = rightOperand * -1;
      dg.setOperator(OPERATOR_ADDITION);
    }
    if (dg.getOperator() === OPERATOR_DIVISION) {
      rightOperand = 1 / rightOperand;
      dg.setOperator(OPERATOR_MULTIPLICATION);
    }
    dg.setLeftOperand(rightOperand);
    dg.transition(STATE_RESULT);
  }
}

class ResultOperandStrategy  extends BaseStrategy {
  onOperator(operator) {
    let dg = this.delegate;
    dg.setOperator(operator);
    dg.setLeftOperand(dg.getAccumulator());
    dg.transition(STATE_OPERATOR);
  }
  onResult() {
    let dg = this.delegate;
    dg.setRightOperand(dg.getAccumulator());
    dg.setAccumulator(dg.operation());
  }
}

// ES6
class Calculator {
  constructor() {
    this.init();
  }

  /**
  * Inicializo los valores de la calculadora, y selecciono el primer estado
  */
  init() {
    this.acc = [];
    this.operator = null;
    this.leftOperand = 0;
    this.rightOperand = 0;
    this.state = null;
    this.strategy = null;
    this.transition(STATE_LEFT_OPERAND);
  }

  /**
  * Selecciono la estrategia deacuerdo al valor del estado
  * @param {String} state
  */
  transition(state) {
    this.state = state;
    switch(state) {
      case STATE_LEFT_OPERAND:
        this.strategy = new LeftOperandStrategy(this);
        break;
      case STATE_RIGHT_OPERAND:
        this.strategy = new RightOperandStrategy(this);
        break;
      case STATE_OPERATOR:
        this.strategy = new OperatorStrategy(this);
        break;
      case STATE_RESULT:
        this.strategy = new ResultOperandStrategy(this);
        break;
    }
  }

  /**
  * inicializo el valor del acumulador recibido en el numero y lo convierto en un arreglo
  * @param {String} tipo de entrada
  * @param {String} tipo Numerico, Operador
  */
  input(type, value, signo) {
	  
    switch(type) {
      case TYPE_NUMBER:
        this.strategy.onNumber(value);
        this.strategy.onSigno(signo);
        break;
      case TYPE_OPERATOR:
        this.strategy.onOperator(value);
        break;
	  case TYPE_ACTION:
          if (value === ACTION_CLEAR){
            this.strategy.onClear();
          }
 		  if (value === ACTION_RESULT){
            this.strategy.onResult();
          }
        break;
    }
    /*this.logger();*/
  }

  /**
  * ejecuto la operacion tomando el oerador izquierdo , operador y operando derecho
  * @return {Number} resultado de la operacion
  */
  operation () {
    let operator = this.operator;
    let result = 0;

    switch(operator) {
      case OPERATOR_DIVISION:
        result = this.leftOperand / this.rightOperand;
      break;
      case OPERATOR_MULTIPLICATION:
        result = this.leftOperand * this.rightOperand;
      break;
      case OPERATOR_ADDITION:
        result = this.leftOperand + this.rightOperand;
      break;
      case OPERATOR_SUBTRACTION:
        result = this.leftOperand - this.rightOperand;
      break;
    }
    return result;
  }

  /**
  * Innicializo el nuevo operando izquierdo
  * @param {Number} nuevo operando izquierdo
  */
  setLeftOperand(value) {
    this.leftOperand = value;
  }

  /**
  * Retorna el valor numerico actual y el opernado izquierdo
  * @return {Number} nuevo operando izquierdo
  */
  getLeftOperand() {
    return this.leftOperand;
  }

  /**
  * Inicializo el nuevo valor del operando derecho
  * @param {Number} nuevo valor del opernado derecho
  */
  setRightOperand(value) {
    this.rightOperand = value;
  }

  /**
  * Retorno el valor numerico actual y el operando derecho
  * @return {Number} Acumulo el valor numerico
  */
  getRightOperand() {
    return this.rightOperand;
  }

  /**
  * Inicializo el valor del nuevo operador
  * @param {Number} valor del operador
  */
  setOperator(value) {
    this.operator = value;
  }

  /**
  * Retorno el operador actual
  * @return {String} operador
  */
  getOperator() {
    return this.operator;
  }

  /**
  * Inicializo el valor del acumulador recibido en el numero que es convertido en un arreglo
  * @param {Number} nuevo valor acumulado
  */
  setAccumulator(value) {
    this.acc = Array.from(String(value));
  }

  /**
  * Retorno el valor numerico actual del acumulador
  * @return {Number} valor numerico acumulado
  */
  getAccumulator() {
    return parseFloat(this.acc.join(''));
  }

  /**
  * Inicializo el valor del acumulador
  */
  clearAccumulator() {
    this.acc = [];
  }

  /**
  * Inicializo el estado de la calculadora
  */
  reset() {
    this.init();
  }

  /**
  * muestro los valores y estados de la calculadora
  */
  logger() {
    console.log({
      acc: this.acc,
      operator: this.operator,
      leftOperand: this.leftOperand,
      rightOperand: this.rightOperand,
      state: this.state
    })
  }

  /**
  * Retorno el valor actual del acumulador
  * @return {String} valor actual del acumulador
  */
  output(type, value, signo) {
    let result = 0;
	result = this.acc.join('');
	if (this.acc.length > 0) {
       if (this.acc.length > NUMBER_DIGIT) 
       { 
          cadena =  result.toString();
          cadena = cadena.substr(0,NUMBER_DIGIT) //quitar el ultimo caracter
		  result = Number(cadena) //mostrar resultado convertido a numero 
       }
	   switch(type) {
	      case TYPE_ACTION:
          if (value === '-'){
             if (signo === "+" && signoaux === ACTION_SIGN  ) /* ya hubo un cambio de signo previo */
			 {           
                result =  result*(1);
                signo = "+"; /* pongo normal el signo del opernado en cuestion */
                signoaux = "+"; /* pongo normal el signo del opernado en cuestion */
			 }
             else 
			 {
                result =  result*(-1);
				signo = '+';
			    signoaux = ACTION_SIGN;
			 }
          }
		  break;
       }
    }
    return result;
  }
}

/** instancio el objeto calculadora */
var calc = new Calculator();
