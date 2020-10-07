class UserController {
    constructor(formIdCreate, formIdUpdate, tableId){
        this.formElement = document.getElementById(formIdCreate);
        this.formUpdateElement = document.getElementById(formIdUpdate)
        this.tableElement = document.getElementById(tableId);
        
        this.onSubmit();
        this.onEdit();
        this.selectAll();
         
    }
    onEdit(){
        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', event =>{
            this.showPanelCreate();
        });

        this.formUpdateElement.addEventListener('submit', event => {
            // event.preventDefault();
            
            let values = this.getValues(this.formUpdateElement);
            let index = this.formUpdateElement.dataset.trIndex;
            let tr = this.tableElement.rows[index];
            let userOld = JSON.parse(tr.dataset.user);
            

            let result = Object.assign({}, userOld, values);
            this.getPhoto(this.formUpdateElement).then(
                (content)=>{
                    if(!values.photo){
                        result._photo = userOld._photo;
                    }else{
                        result._photo = content;
                    } 
                    let user = new User();
                    user.loadFromJSON(result);

                    user.save().then(user => {

                        this.getTr(user, tr);
                        this.addEventsTr(tr);
                        this.updateCount();
                        this.formUpdateElement.reset(); 
                        this.showPanelCreate();
                    });          
                },
                (error)=>{
                    console.error(error);
            
            });
            
        });
    }
    onSubmit(){
        this.formElement.addEventListener('submit', event => {
            event.preventDefault();

            let buttonSubmit = this.formElement.querySelector('[type=submit]');
            buttonSubmit.disable = true;

            let values = this.getValues(this.formElement);
            
            if(!values) return false;

            this.getPhoto(this.formElement).then(
                (content)=>{
                    values.photo = content;
                    
                    values.save().then(user => {
                        
                        this.addUserList(user);
                    });
            
                    this.formElement.reset();

                },
                (error)=>{
                    

            });

        }); 
    }
    getPhoto(formElement){
        return new Promise((resolve, reject) =>{
            let fileReader = new FileReader();
        let elements = [...formElement.elements].filter(item =>{
            if(item.name === 'photo'){
                return item;
            }
        });

        let file = elements[0].files[0];
        fileReader.onload = ()=>{
            
            resolve(fileReader.result);

        };
        fileReader.onerror = (error) =>{
            reject(error);
        }
        if(file){
            fileReader.readAsDataURL(file);
        }else{
            resolve('/dist/img/boxed-bg.jpg');
        }

        });
        
    }

    getValues(formElement){
        let user = {};
        let isValid = true;
        // Operator Spread ...
        [...formElement.elements].forEach((fild,index) =>{
            
            if(['name','email','password'].indexOf(fild.name) > -1 && !fild.value){
                fild.parentElement.classList.add('has-error');
                isValid = false;
            }

            if(fild.name == 'gender'){
                if(fild.checked){
    
                    user[fild.name] = fild.value;
                }
            }else if(fild.name == 'admin'){
                user[fild.name] = fild.checked;
            }else{
                user[fild.name] = fild.value;
            }
        });
        if(!isValid){
            return false;
        }
        
        return new User(
            user.name,
            user.gender, 
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin,
            user.date
        );
    }
    selectAll(){
        // let users = User.getUsersStorage();

        User.getUsersStorage('/users').then(data => {

            data.users.forEach(dataUser => {
                let user = new User();
                user.loadFromJSON(dataUser);
                this.addUserList(user);
            });
        }); 
    }
    addUserList(userData){
        let tr = this.getTr(userData)
        
        this.tableElement.appendChild(tr);
        
        this.updateCount();
    }
    getTr(userData, tr = null){
        if(tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(userData);
        tr.innerHTML= 
        `           
            <td><img src="${userData.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${userData.name}</td>
            <td>${userData.email}</td>
            <td>${(userData.admin) ? 'Sim' : 'Não'}</td>
            <td>${(Utils.formartDate(userData.date))}</td>
            <td>
                <button type="button" class="btn btn-primary btn-xs btn-flat btn-edit">Editar</button>
                <button type="button" class="btn btn-danger button-delete btn-xs btn-flat">Excluir</button>
            </td>

        `;
        this.addEventsTr(tr);
        return tr;

    }
    addEventsTr(tr){
        tr.querySelector('.button-delete').addEventListener('click', event => {
            if(confirm("Deseja realmente excluir ?")){
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove().then(data => {
                    
                    tr.remove();
                    this.updateCount();
                });    
                
            }
        });
        tr.querySelector('.btn-edit').addEventListener('click', event =>{
            let json = JSON.parse(tr.dataset.user);
            
            this.formUpdateElement.dataset.trIndex = tr.sectionRowIndex;
            for(let name in json){
               let field = this.formUpdateElement.querySelector("[name=" + name.replace("_", "") + "]" );

               if(field){
                   switch(field.type){
                       case 'file':
                           continue;
                            break;   
                        case 'radio':
                            field = this.formUpdateElement.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;
                            
                     
                            break;
                        case 'checkbox':
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];
                    }
                }
            }
            this.formUpdateElement.querySelector('.photo').src = json._photo;
            this.showPanelUpdate();
        });
    }
    showPanelCreate(){
        document.getElementById('box-user-create').style.display = 'block';
        document.getElementById('box-user-update').style.display = 'none';

    }
    showPanelUpdate(){
        document.getElementById('box-user-create').style.display = 'none';
        document.getElementById('box-user-update').style.display = 'block';
    }

    updateCount(){
        let numberUsers = 0;
        let numberAdmin = 0;   
        
        [...this.tableElement.children].forEach(tr => {
            numberUsers++;
            
            let user = JSON.parse(tr.dataset.user);
            
            if(user._admin){
                numberAdmin++;
            }
            
        });
        document.getElementById('number-users').innerHTML = numberUsers;
        document.getElementById('number-users-admin').innerHTML = numberAdmin;

    }
} 