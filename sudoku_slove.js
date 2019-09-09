var DIGITS   = '123456789';
var ROWS     = 'ABCDEFGHI';
var COLS     = '123456789';
var SQUARE_ARRAY  = _cross(ROWS, COLS);
/**
 * a collection of nine squares (column, row, or box) 
 */
var UNITS = _create_units();
/**
 * squares that share a unit
 */
var PEERS = _create_peers();

function _search(value_dict){
	//在先前階段已經發生錯誤
	if(value_dict == false) return false;

	//終止條件，如果 value_dict 的值域皆只有一個值，則代表數獨已解完
	var is_ended = SQUARE_ARRAY.every(function(square){ return value_dict[square].length === 1});
	if(is_ended === true) return value_dict;

	//開始 search
	//找有最小值域的 square
	var len_array = SQUARE_ARRAY.map(function(square){
		var len = test2[square].length;
		return len > 1 ? len : 999
	});
	var next_square = Math.min(...len_array);

	//對 next_square 做 back tracking search
	for(let value of value_dict[next_square]){
		var new_value_dict = Object.assign({},value_dict);
		var value_dict_after_assign = _assign(new_value_dict,next_square,value);
		_search(value_dict_after_assign);
	}
}

/**
 * 以 constraint propagation 初步簡化值域 values
 * @param {*} grid 數獨謎題，資料型態:字串
 */
function _parse_grid(grid){
	/**
	 * square 的值域，鍵值對應，ex: values = {A1: "123456789", A2: "123456789".....
	 */
	var value_dict = {};
	for(let square of SQUARE_ARRAY){
		value_dict[square] = DIGITS;
	}

	var converted_grid = _grid_values(grid);
	for(let index in converted_grid){
		let square = converted_grid[index][0];
		let value = converted_grid[index][1];

		if((DIGITS.indexOf(value) !== -1)){
			let is_success = _assign(value_dict, square, value);
			if(is_success === false){
				console.log("發生錯誤\n s: "+square+" d: "+value);
				return false;
			}
		}
	}

	return value_dict;
}
/**
 * 將 grid 格式從 011.... 轉換為 [['A1',0], ['A2',1].....]
 * @param {*} grid 
 */
function _grid_values(grid){
	var chars = [];
    for(var c of grid){
        if((DIGITS.indexOf(c) !== -1) || ('0.'.indexOf(c) !== -1)){
            chars.push(c);
        }
    }
	return SQUARE_ARRAY.map((v, i) => [v, chars[i]]);
}
/**
 * 將位置 s 的值域中，除 d 值外全部刪除
 * @param {*} value_dict square 的值域
 * @param {*} square 位置
 * @param {*} value 值
 */
function _assign(value_dict, square, value){
    var other_values = value_dict[square].replace(value, '');
    for(let d2 of other_values){
        var is_success = _eliminate(value_dict,square,d2);
        if(is_success === false) return false;
    }

    return value_dict;
}
/**
 * 將位置 s 的值域 values 中，刪除 d 值
 * @param {*} value_dict 值域 
 * @param {*} square 位置
 * @param {*} value 值
 */
function _eliminate(value_dict, square, value){
    //判斷是否已刪除
    if(value_dict[square].indexOf(value) === -1){
        return value_dict;
    }
    
    value_dict[square] = value_dict[square].replace(value,''); //移除 d 值

    //衝突: 值域的最後一個值被移除
    if(value_dict[square].length === 0){
        return false; 
    }

    // (1)如果位置 square 的值域已縮減至只有一個值 d2，則將該值從其 peers 的值域中移除
    if(value_dict[square].length === 1){
        var solved_value = value_dict[square];
        for(let square of PEERS[square]){
            var is_success = _eliminate(value_dict, square, solved_value);
            if(is_success === false) return false;
        }
    }

    // (2) 如果某個 unit 只有一個位置可以放 d 值，則將其放在那。
    for(let unit of UNITS[square]){
        var dplaces = [];
        for(let square of unit){
            if(value_dict[square].indexOf(value) !== -1 ){
                dplaces.push(square);
            }
        }

        if(dplaces.length === 0){ // 衝突: 沒有位置可以放 d 值
            return false;
        }
        if(dplaces.length === 1){
            var is_success = _assign(value_dict, dplaces[0], value); // 該欄位給值
            if(is_success === false) return false;
        }
    }

    return value_dict;
}
/**
 * 建立 peers
 */
function _create_peers(){
	var result = [];
	for(let s of SQUARE_ARRAY){
		// 找出 s 的三個 units 陣列
		var tmp = UNITS[s];
		
		// 將三個陣列並集
		var union = tmp[0].concat(tmp[1].filter(
			function(v){
				return !(tmp[0].indexOf(v) > -1)
			}
		))
		.concat(tmp[2].filter(
			function(v){
				return (!(tmp[0].indexOf(v) > -1) && !(tmp[1].indexOf(v) > -1))
			}
		))
		
		// 將並集後的陣列與 s 取差集
		var obj = union.filter(value => value !== s)
		
		result[s] = obj;
	}
	return result;
}
/**
 * 建立 units
 */
function _create_units(){
	var unitlist = _create_unitlist();

	var obj = {};
	for(let s of SQUARE_ARRAY){
		for(let u of unitlist){
			if(u.includes(s)){
				if(obj[s] == undefined){
					obj[s] = [];
					obj[s].push(u);
				}
				else
					obj[s].push(u);
			}
		}
	}
	return obj;
}
/**
 * 建立 unit list 列表
 */
function _create_unitlist(){
	var tmp = [];
	for(let c of COLS){
		tmp.push(_cross(ROWS,c));
	}
	
	for(let r of ROWS){
		tmp.push(_cross(r,COLS));
	}
	
	for(let rs of ['ABC','DEF','GHI']){
		for(let cs of ['123','456','789'])
			tmp.push(_cross(rs,cs))
	}
				
	return tmp;
}
/**
 * 將 A 陣列 cross B 陣列
 * @param {*} A 陣列
 * @param {*} B 陣列
 */
function _cross(A,B){
	var array = [];	
	for(let a of A){
		for(let b of B){
			array.push(a+b)
		}
	}
	return array;
}