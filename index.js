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
    const result = await structure(`${type}.Документ`, ['*'], {}); 
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
        if(item.attribute.isFilter){//фильтр по элементу
            console.log(item);
            addFilter(item);
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
//отрисовка фильтра
function addFilter(element){
    const filterData = document.getElementById('filterData');
    filterData.innerHTML = '';
    switch (element.attribute.type) {
        case 'string':
            let inputString = `<div class="column col-4">
                            <div class="form-group input-group">
                                <label class="form-label">Наименование: </label>
                                <input id="" name="" class="form-input " type="text" maxlength="255">
                            </div>
                        </div>`;
            filterData.insertAdjacentHTML('beforeend', inputString);
            break;
        case 'number':
            let inputNumber = `<div class="column col-4">
                            <div class="form-group input-group">
                                <label class="form-label">Наименование: </label>
                                <input id="" name="" class="form-input " type="text" maxlength="255">
                            </div>
                        </div>`;
            filterData.insertAdjacentHTML('beforeend', inputNumber);
            break;
        case 'reference':
            let inputReference = `<div class="column col-4">
                                    <div class="form-group input-group">
                                        <label class="form-label" for="search-input">Материал: </label>
                                        <div class="has-icon-right">
                                            <input type="text" id="" data-type="searchInput" data-element="data" data-reference="Справочник.Материалы.Наименование" name="Материал" class="form-input" placeholder="Выберите элемент" style="width: -webkit-fill-available; background-color: white;" value="" readonly="">
                                            <i class="form-icon icon icon-caret"></i>
                                        </div>
                                        <div data-id="" class="dropdown-content" style="display: none;"><div data-value="option1">Option 1</div>
                                            <div data-value="option2">Option 2</div>
                                            <div data-value="option3">Option 3</div>
                                            <div data-value="option4">Option 4</div>
                                            <div data-value="option5">Option 5</div>
                                            <div class="add-button">+ Добавить</div>
                                        </div>
                                    </div>
                                </div>`;
            filterData.insertAdjacentHTML('beforeend', inputReference);                    
            break;
        default:
            break;
    }
}

//данные для фильтра с сервера
function getFilterData(element, data){
    journalRequisite.condition.push(element, data);
    createTableBody(journalRequisite, type);
}


//Обработка инпута с выпадающим списком
document.addEventListener('DropdownInput', function(){
    const searchInputs = document.querySelectorAll('[data-type="searchInput"]');
    if(searchInputs){
        searchInputs.forEach(input => {
            let dropdownContent = document.querySelector(`[data-id="${input.id}"]`);
            input.addEventListener('focus', function(){            
                dropdownContent.style.display = 'block';                       
            });
    
            dropdownContent.addEventListener('click', function(e) {
                if (e.target && e.target.nodeName === "DIV" && !e.target.classList.contains('add-button')) {
                    input.value = e.target.textContent;
                    dropdownContent.style.display = 'none';
                } else if (e.target && e.target.classList.contains('add-button')) {
                   let reference = input.dataset.reference.split('.');               
                  // newWindow = createWindow();
                   //newWindow.dataset.input = input.id;
                   //createFrameSelectJournal(reference, newWindow);
                   setWindow(frameId, reference, input.id,);
                   dropdownContent.style.display = 'none';           
                }
            });
    
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.dropdown')) {
                    dropdownContent.style.display = 'none';
                }
            });
        });
    }
    
});