const DB = {}

// db connection is connetion to database 
DB.connection = {}

// db server is url of server
DB.server = null;

// db query is manual query
DB.query = async (query, func, act = "data") => {
var params = new URLSearchParams();
    params.append('host', DB.connection.host)
    params.append('username', DB.connection.user)
    params.append('password', DB.connection.password)
    params.append('database', DB.connection.database)
    params.append('key', DB.connection.key)
    params.append('action', act)
    params.append('query', query)
    
    try{
        let res = await axios.post(DB.server, params);
        
        if (Array.isArray(res.data)) {
            let data = res.data;
            func(res.data);
        }else{

            if (res.data == "save") {
                func(res.data);
            }else{
                let html = `
                    <div id="error-db-connection">
                        <style>

                            .body-error-message{
                                position: fixed;
                                display: block;
                                bottom: calc(100vh - 50px);
                                padding: 10px;
                                right: 10px;
                                background: #333333;
                                color: white;
                                z-index: 10000;
                                animation: error 4s ease-in-out;
                            }

                            @keyframes error{
                                0%{
                                    bottom: 10px;
                                    opacity: 0;
                                }
                                50%{
                                    bottom: calc(100vh - 50px);
                                    opacity: 1;
                                }
                                90%{
                                    bottom: calc(100vh - 50px);
                                    opacity: 0;
                                }
                            }

                        </style>
                        <span class="body-error-message">check your database connection</span>
                    </div>
                `;


                document.body.innerHTML += html;

                console.log(query);

                console.log()
                setTimeout(()=>{
                    document.getElementById('error-db-connection').remove();
                    DB.query(query, func, act);
                },3600)
            }

        }
    } catch(error){
        if (error == "Error: Network Error") {

            let html = `
                <div id="error-db-connection">
                    <style>

                        .body-error-message{
                            position: fixed;
                            display: block;
                            bottom: calc(100vh - 50px);
                            padding: 10px;
                            right: 10px;
                            background: #333333;
                            color: white;
                            z-index: 10000;
                            animation: error 4s ease-in-out;
                        }

                        @keyframes error{
                            0%{
                                bottom: 10px;
                                opacity: 0;
                            }
                            50%{
                                bottom: calc(100vh - 50px);
                                opacity: 1;
                            }
                            90%{
                                bottom: calc(100vh - 50px);
                                opacity: 0;
                            }
                        }
                    </style>
                    <span class="body-error-message">your connection lost</span>
                </div>
            `;


            document.body.innerHTML += html;

            console.log()
            setTimeout(()=>{
                document.getElementById('error-db-connection').remove();
                DB.query(query, func, act);
            },3600)
        }
    }
}

// read functio
DB.server = "http://localhost/server/index.php"

DB.connection = {
    host: "localhost",
    user: "root",
    password: "",
    database: "electron",
    key: "halohalobandung"
}

function isFunction(variableToCek){
    if (variableToCek instanceof Function) {
        return true;
    }else{
        return false;
    }
}

DB.read = function(table, opsi, condition, limit, order, func = null){
    
    let cond = '';
    let where = '';

    if (isFunction(condition)) {
        func = condition;
    }


    if (Array.isArray(opsi)) {
        opsi = opsi.join(', ');   
    }



    if (typeof condition === 'object') {
        func = null;
        let myor = Object.keys(condition).map(function(item){
            if (typeof condition[item] === 'object' && item.indexOf('OR') != -1) {
                return '( '+Object.keys(condition[item]).map(function(itemx){
                    if(condition[item][itemx].indexOf('%') != -1){
                        if (itemx.indexOf('_')) {
                            let splitback = itemx.split('_');
                            let split = itemx.split('_');
                            if(split.length > 1){
                                split.pop();
                            }
                            console.log(splitback);
                            return split.join('_')+' LIKE "'+condition[item][itemx]+'"';
                        }else{
                            return itemx+' LIKE "'+condition[item][itemx]+'"';
                        }
                    }else{
                        if (itemx.indexOf('_')) {
                            let split = itemx.split('_');
                            if(split.length > 1){
                                split.pop();
                            }
                            return split.join('_')+' = "'+condition[item][itemx]+'"';
                        }else{
                            return itemx+' = "'+condition[item][itemx]+'"';
                        }
                    }
                }).join(' OR ')+' )';
            }else{
                if(condition[item].indexOf('%') != -1){
                    if (item.indexOf('_')) {
                        let split = item.split('_');
                        if(split.length > 1){
                            split.pop();
                        }
                        return split.join('_')+' LIKE "'+condition[item]+'"';
                    }else{
                        return item+' LIKE "'+condition[item]+'"';
                    }
                }else{
                    if (item.indexOf('_')) {
                        let split = item.split('_');
                        if(split.length > 1){
                            split.pop();
                        }
                        return split.join('_')+' = "'+condition[item]+'"';
                    }else{
                        return item+' = "'+condition[item]+'"';
                    }
                }
            }
        }).join(' AND ');
        console.log(myor);
        cond = myor;
    }

    if (isFunction(limit)) {
        func = limit;
    }
    
    if (isFunction(order)) {
        func = order;
    }
    if (cond != '') {
        where = 'WHERE';
    }
    DB.query(`SELECT ${opsi} FROM `+table+' '+where+' '+cond, func)
}


DB.create = function(table, condition, func){
    if (typeof condition === "object") {
        
        let keys = Object.keys(condition);

        let val = keys.map((item) => {
            return '"'+condition[item]+'"';
        }).join(", ");

        DB.query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${val}) `, func, 'save')

    }else{
        console.log('sorry data is not object');
    }
}

DB.delete = function(table, condition, func){
    if (typeof condition === "object") {
        
        let val = Object.keys(condition).map((item) => {
            return ' '+item+' = "'+condition[item]+'"';
        }).join(" AND ");
        DB.query(`DELETE FROM ${table} WHERE ${val}`, func, 'save')
    }else{
        console.log('sorry data is not object');
    }
}

DB.update = function(table, dataupdate, condition, func){
    if (typeof dataupdate === "object") {
        if (typeof condition === "object") {
            
            let data = Object.keys(dataupdate).map((item) => {
                return ' '+item+' = "'+dataupdate[item]+'"';
            }).join(", ");

            let val = Object.keys(condition).map((item) => {
                return ' '+item+' = "'+condition[item]+'"';
            }).join(" AND ");


            DB.query(`UPDATE ${table} SET ${data} WHERE ${val}`, func, 'save')
        }else{
            console.log('sorry data is not object');
        }
    }else{
        console.log('sorry data is not object');
    }
}