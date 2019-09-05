var digits   = '123456789';
var rows     = 'ABCDEFGHI';
var cols     = digits;
var squares  = _cross(rows, cols);

var unitlist = _create_unitlist();
var units = _create_units();
var peers = _create_peers();

/*將位置 s 的值域中，除 d 值外全部刪除*/
function assign(values, s, d){
    var other_values = values[s].replace(d, '');
    for(d2 of other_values){
        var is_success = eliminate(values,s,d2);
        if(is_success === false) return false;
    }

    return values;
}

/*將位置 s 的值域 values 中，刪除 d 值*/
function eliminate(values, s, d){
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
        for(let s2 of peers[s]){
            var is_success = eliminate(values, s2, d2);
            if(is_success === false) return false;
        }
    }

    // (2) 如果某個 unit 只有一個位置可以放 d 值，則將其放在那。
    for(let u of units[s]){
        var dplaces = [];
        for(let s of u){
            if(values[s].indexOf(d) !== -1 ){
                dplaces.push(d);
            }
        }

        if(dplaces.length === 0){ // 衝突: 沒有位置可以放 d 值
            return false;
        }
        if(dplaces.length === 1){
            var is_success = assign(values, dplaces[0], d); // 該欄位給值
            if(is_success === false) return false;
        }
    }

    return values;
}

/*將011....轉換為 [{A1:0}, {A2:1}.....]*/
function grid_values(grid){
	var chars = [];
    for(var c of grid1){
        if((digits.indexOf(c) !== -1) || ('0.'.indexOf(c) !== -1)){
            chars.push(c);
        }
    }
	return squares.map(function(v, i) {
          return [v, chars[i]];
        })
}

function _create_peers(){
	var result = [];
	for(let s of squares){
		// 找出 s 的三個 units 陣列
		var tmp = [];
		units.find(function(obj){
			if(Object.keys(obj) == s){
				tmp.push(obj);
			}
		})
		
		// 將三個陣列並集
		var union = tmp[0][s].concat(tmp[1][s].filter(
			function(v){
				return !(tmp[0][s].indexOf(v) > -1)
			}
		))
		.concat(tmp[2][s].filter(
			function(v){
				return (!(tmp[0][s].indexOf(v) > -1) && !(tmp[1][s].indexOf(v) > -1))
			}
		))
		
		// 將並集後的陣列與 s 取差集
		var obj = {};
		obj[s] = union.filter(value => value !== s)
		
		result.push(obj);
	}
	return result;
}

function _create_units(){
	var tmp = [];
	for(let s of squares){
		for(let u of unitlist){
			if(u.includes(s)){
				var obj = {};
				obj[s] = u;
				tmp.push(obj);
			}
		}
	}
	return tmp;
}

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

function _cross(A,B){
	var array = [];	
	for(let a of A){
		for(let b of B){
			array.push(a+b)
		}
	}
	return array;
}