let token;
let type = 'Документ';
let journalRequisite;
let object = {
    form:'',
    type:'',
    requisite: [],
    condition: []
};


login().then(result => {
    console.log(result);
    if(result.response.token) {
        token = result.response.token;
    }
    journal();
    
})

async function sendRequest(data) {
    try {
        const response = await fetch('https://dev.pc2b.ru/engine/framework.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const data_1 = await response.json();
        return data_1;
    } catch (error) {
        console.error(error);
    }       
}

async function login() {
    let request = {
        token: 0,
        get_auth : {'ID': '1', 'PASW': 'esw1251yz'}
    } 
    let result = await sendRequest(request);
    return result;  
}

async function structure(object, what, where) { 
    let request = await createRequest(object, what, where);  
    request.query.operation = 'Структура';
    let result = await sendRequest(request);
    return result;  
}

function createRequest(object, what, where) {
    const request = {
        token: token,
        query: {
            type: '',
            object: '',
            table: false,
            operation: '', // Выбрать, Обновить, Добавить, Удалить
            data: []
        }
    }
    let objectData = object.split('.');
    request.query.type = objectData[0];
    if(objectData[1]){
        request.query.object = objectData[1];
    }    
    if(objectData[2]) {
        request.query.table = true;
    }
    request.query.data = [what, where];
    return request;
}

async function journal(){
    const result = await structure(`${type}.ПоступлениеМатериалов`, ['*'], {}); 
    console.log(result.response.form);    
    journalRequisite = createTableHead(result.response.form);
    createTableBody(journalRequisite, type);
}


function createTableHead(form){ 
    let thead = document.querySelector('thead');
    let tr = document.createElement('tr');
    thead.innerHTML = '';
    object.form = form.id; 
    object.requisite = [];
    object.condition = [];
    form.requisite.forEach(item => {      
        if(!item.attribute){return;}  
        if(item.attribute.useInSelection){  
            if(item.attribute.useInIndexes){
            }
            object.requisite.push(item.id);
            let th = document.createElement('th');    
            if(item.attribute.system && item.attribute.system.type == 'timestamp'){
            }
            if(item.attribute.system && item.attribute.system.type == 'autoincrement'){
                elementId = item.id;
              th.style = "width:75px";
            }                 
            th.textContent = item.attribute.synonym;
            tr.appendChild(th);
        }        
    })
    let mdTh = document.createElement('th');
    mdTh.style = 'width:50px';
    tr.appendChild(mdTh); 
    thead.appendChild(tr); 
    object.requisite.push('MD'); 
    console.log(object);
    return object;
}

function createTableBody(requisite, type){ 
    sendRequest({'token': token, 'get_data': requisite})
    .then(result => {
        let tbody = document.querySelector('tbody');
        tbody.innerHTML = '';
        result.response.forEach(element => {
            let tr = document.createElement('tr');
            tr.dataset.row = 'tr';
            tr.id = element[0];                
            for (let i = 0; i < element.length; i++){                  
              let td = document.createElement('td');
              td.innerText = element[i];
             // indexRequsite.push(element[i]);
              if (i == element.length - 1) {
                td.innerText = '';
                let img = document.createElement('img');
                tr.dataset.status = element[i];
                switch (element[i]) {
                    case null:
                        img.src = '../img/created.png';
                        break;
                    case 1:
                        img.src = '../img/posted.png';   
                        break;
                    case 9:
                        img.src = '../img/deleted.png';  
                        tr.style = "background-image: linear-gradient(45deg, #e4b5b554 25%, transparent 25%, transparent 50%, #e4b5b554 50%, #e4b5b554 75%, transparent 75%, transparent); background-size: 10px 10px;";
                        break;
                    default:
                        td.innerText = 'Unknown'; // На случай, если значение не соответствует ни одному из условий
                        break;
                }
                img.style = 'width: 20px; display: block;';
                td.appendChild(img);
            }
              tr.appendChild(td);                
            }             
            tbody.appendChild(tr);   
        })
    })
    
}
