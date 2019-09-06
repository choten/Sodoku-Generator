var DIGITS   = '123456789';
var rows     = 'ABCDEFGHI';
var cols     = '123456789';
var SQUARES  = _cross(rows, cols);
var unitlist = _create_unitlist();
/**
 * a collection of nine squares (column, row, or box) 
 */
var UNITS = _create_units();
/**
 * squares that share a unit
 */
var PEERS = _create_peers();

/**
 * 以 constraint propagation 初步簡化值域 values
 * @param {*} grid 數獨謎題
 */
function parse_grid(grid){
	var values = {};
	for(let s of SQUARES){
		values[s] = DIGITS;
	}

	var converted_grid = grid_values(grid);
	for(let index in converted_grid){
		let s = converted_grid[index][0];
		let d = converted_grid[index][1];

		if((DIGITS.indexOf(d) !== -1)){
			let is_success = _assign(values, s, d);
			if(is_success === false){
				console.log("s:"+s);
				console.log("d:"+d);
				return false;
			}
		}
	}

	return values;
}
/**
 * 將 grid 格式從 011.... 轉換為 [['A1',0], ['A2',1].....]
 * @param {*} grid 
 */
function grid_values(grid){
	var chars = [];
    for(var c of grid){
        if((DIGITS.indexOf(c) !== -1) || ('0.'.indexOf(c) !== -1)){
            chars.push(c);
        }
    }
	return SQUARES.map((v, i) => [v, chars[i]]);
}
/**
 * 將位置 s 的值域中，除 d 值外全部刪除
 * @param {*} values 值域
 * @param {*} s 位置
 * @param {*} d 值
 */
function _assign(values, s, d){
    var other_values = values[s].replace(d, '');
    for(let d2 of other_values){
        var is_success = _eliminate(values,s,d2);
        if(is_success === false) return false;
    }

    return values;
}
/**
 * 將位置 s 的值域 values 中，刪除 d 值
 * @param {*} values 值域 
 * @param {*} s 位置
 * @param {*} d 值
 */
function _eliminate(values, s, d){
    //判斷是否已刪除
    if(values[s].indexOf(d) === -1){
        return values;
    }
    
    values[s] = values[s].replace(d,''); //移除 d 值

    //衝突: 值域的最後一個值被移除
    if(values[s].length === 0){
        return false; 
    }

    // (1)如果位置 s 的值域已縮減至只有一個值 d2，則將該值從其 peers 的值域中移除
    if(values[s].length === 1){
        var d2 = values[s];
        for(let s2 of PEERS[s]){
            var is_success = _eliminate(values, s2, d2);
            if(is_success === false) return false;
        }
    }

    // (2) 如果某個 unit 只有一個位置可以放 d 值，則將其放在那。
    for(let u of UNITS[s]){
        var dplaces = [];
        for(let s of u){
            if(values[s].indexOf(d) !== -1 ){
                dplaces.push(s);
            }
        }

        if(dplaces.length === 0){ // 衝突: 沒有位置可以放 d 值
            return false;
        }
        if(dplaces.length === 1){
            var is_success = _assign(values, dplaces[0], d); // 該欄位給值
            if(is_success === false) return false;
        }
    }

    return values;
}
/**
 * 建立 peers
 */
function _create_peers(){
	var result = [];
	for(let s of SQUARES){
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
	var obj = {};
	for(let s of SQUARES){
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
	for(let c of cols){
		tmp.push(_cross(rows,c));
	}
	
	for(let r of rows){
		tmp.push(_cross(r,cols));
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