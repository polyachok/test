let token;
let type = 'Документ';
let journalRequisite;
let object = {
    form:'',
    type:'',
    requisite: [],
    condition: []
};

const generateRandomId = () => {
    let id = '';
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    const microtime = Date.now() / 1000;
    const timestamp = Math.floor(microtime * 1000000).toString(36);
    id += timestamp;
    
    id += letters[Math.floor(Math.random() * letters.length)];
    
    for (let i = 1; i < 32; i++) {
        id += characters[Math.floor(Math.random() * characters.length)];
    }
    return id;
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

//обработка журнала
async function journal(){
    const result = await structure(`${type}.ПоступлениеТоваров`, ['*'], {}); 
    filter(result.response.form);
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
        if(item.attribute.isFilter){//фильтр по элементу
           // addFilter(item);
        }        
    })
    let mdTh = document.createElement('th');
    mdTh.style = 'width:50px';
    tr.appendChild(mdTh); 
    thead.appendChild(tr); 
    object.requisite.push('MD'); 
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
//-------------------------------------------------------------

//обработка диалогов
function openDialog(dialogId) {
    fetch('dialog.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const dialog = doc.getElementById(dialogId);

            if (dialog) {
                const container = document.getElementById('dialog-container');
                container.innerHTML = ''; // Clear previous dialogs
                container.appendChild(dialog);
                dialog.show();
            } else {
                console.error(`Dialog with ID ${dialogId} not found.`);
            }
        })
        .catch(error => console.error('Error loading dialog:', error));
}

function closeDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog && dialog.open) {
        dialog.close();
    } else {
        console.error(`Dialog with ID ${dialogId} not found or is already closed.`);
    }
}
//--------------------------------------------------------------

//отрисовка фильтра
function filter(data){
    console.log(data);
    let reference = false;
    const filterData = document.getElementById('filterData');
    filterData.innerHTML = '';
    const filteredRequisites = data.requisite.filter(requisite => requisite.attribute.isFilter);
    const rowCount = Math.ceil(filteredRequisites.length / 3);
    for (let i = 0; i < rowCount; i++) {
        let row = document.createElement('div');
        row.classList.add('columns');
        for (let j = i; j < i + 3 && j < filteredRequisites.length; j++) {
            let element = filteredRequisites[j];
            if(element.attribute.type == 'reference'){
                reference = true;
            }
            let input = addFilter(element);
            row.insertAdjacentHTML('beforeend', input);
        }
        filterData.appendChild(row);
    }      
    if(reference){
        document.dispatchEvent(new Event('DropdownInput'));
        reference = false;
    }
     
    let rowBtn = `<div class="columns">
                    <div class="column col-5">
                        <button class="btn mt-2" onclick="getFilterData()">Сформировать</button>
                    </div>
                </div>`; 
    filterData.insertAdjacentHTML('beforeend', rowBtn);
}

//формируем инпуты для фильтра
function addFilter(element){
    let input;
    switch (element.attribute.type) {
        case 'string':
            input = `<div class="column col-4">
                        <div class="form-group input-group">
                            <label class="form-label">${element.attribute.name}: </label>
                            <input class="form-input" data-filter="filterInput" data-element="${element.id}" type="text">
                        </div>
                    </div>`;           
            break;
        case 'number':
            input = `<div class="column col-4">
                            <div class="form-group input-group">
                                <label class="form-label">${element.attribute.name}: </label>
                                <input class="form-input" data-filter="filterInput" data-element="${element.id}" type="text">
                            </div>
                        </div>`;
            break;
        case 'reference':
            input = `<div class="column col-4">
                        <div class="form-group input-group">
                            <label class="form-label" for="search-input">${element.attribute.name}: </label>
                            <div class="has-icon-right">
                                <input id="${element.id}" type="text" onfocus="dropdownOption(this)" data-type="searchInput" data-filter="filterInput" data-element="data" data-reference="Справочник.Материалы.Наименование" name="Материал" class="form-input" placeholder="Выберите элемент" style="width: -webkit-fill-available; background-color: white;" value="" readonly="">
                                <i class="form-icon icon icon-caret"></i>
                            </div>
                            
                        </div>
                    </div>`;
            break;
        case 'boolean':
            input = `<div class="column col-4">
                        <div class="form-group">
                        <label class="form-checkbox">
                            <input type="checkbox" data-filter="filterInput" data-element="${element.id}">
                            <i class="form-icon"></i> ${element.attribute.name}
                        </label>
                        </div>
                    </div>`;
            break;
        default:
            break;
    }
    return input;
}

//данные согласно фильтра с сервера
function getFilterData(){
    const filterInputs = document.querySelectorAll('[data-filter="filterInput"]');
    filterInputs.forEach(input => {
        console.log('element - ' + input.dataset.element + ' - ' + 'data - ' + input.value);
        journalRequisite.condition.push({[input.dataset.element]: input.value});
    })
    createTableBody(journalRequisite, type);
}
//--------------------------------------------------------------

//Обработка инпута с выпадающим списком
function dropdownOption(input){
    setWindow(input.dataset.reference.split('.'), input.id);
}

function setWindow(reference, input = null){
    let newWindow = createWindow();        
    newWindow.dataset.input = input;
    createFrameSelectJournal(reference, newWindow);
   
}

function createFrameSelectJournal(reference, newWindow){
    let iframe = document.createElement('iframe');
    let frameID = generateRandomId();      
    src = '/component/filter_journal.html';
    iframe.src = src;
    iframe.id = frameID;
    iframe.setAttribute('style', 'width: 100%; height: calc(100vh - 391px);border: none; bottom: 0;');
    newWindow.querySelector('.content').appendChild(iframe); 
    newWindow.querySelector('#windowTitle').innerText = reference[1];
    document.querySelector('.container').insertAdjacentElement('afterbegin', newWindow);

    iframe.onload = function() {        
        let message = {action: 'window', id: frameID, reference: reference, window: newWindow.id /*name: name, altName: altName, type: type*/};
        iframe.contentWindow.postMessage(message, host);
    }   
}

