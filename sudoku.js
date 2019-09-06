var numbers = [1,2,3,4,5,6,7,8,9];

var matrix = new Array(9);
for(var i = 0; i < matrix.length; ++i){
	matrix[i] = new Array(9);
	for(var j = 0;j < matrix.length;++j){
		matrix[i][j] = 0;
	}
}

//給定三個初始 independent matrix
setMatrix(matrix,numbers);

/*洗亂數字排序*/
function shuffleNumbers(array){
	for(var i = array.length-1;i>0;--i){
		var rnd = Math.floor(Math.random()*(i+1));
		var tmp = array[i];
		array[i] = array[rnd];
		array[rnd] = tmp;
	}
	return array;
}

/*Matrix 給值*/
function setMatrix(matrix,numbers){
	for(var j = 0;j<3;++j){
		numbers = shuffleNumbers(numbers);
		
		for(var i = 0; i < numbers.length; ++i){
			var x = (i % 3)+ 3*j;
			var y = Math.floor(i / 3) + 3*j;
			matrix[y][x] = numbers[i];
		}
	}
	
	return matrix;
}