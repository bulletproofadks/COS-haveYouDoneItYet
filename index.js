localStorage.removeItem("randid")
let Keys = localStorage.length;
let arrayOfObjects = []

class Model {
    constructor(key) {
        this.key = key
        if (localStorage.getItem(`${key}`))
            this.todos = JSON.parse(localStorage.getItem(`${key}`))
        else {
            localStorage.setItem(`${key}`, JSON.stringify([]))
            this.todos = JSON.parse(localStorage.getItem(`${key}`))
        }
    }
    _commit(todos) {
        arrayOfObjects[this.key].view.renderTodos(this.key, this.todos);
        localStorage.setItem(`${this.key}`, JSON.stringify(todos))
    }
    addTodo(noobTodoText) {
        const noobTodo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: noobTodoText,
            complete: false,
        }
        this.todos.push(noobTodo);
        this._commit(this.todos)
    }
    editTodo(id, updatedText) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { id: todo.id, text: updatedText, complete: todo.complete } : todo
        )

        this._commit(this.todos)
    }
    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { id: todo.id, text: todo.text, complete: !todo.complete } : todo
        )
        this._commit(this.todos)
    }
    deleteTodo(id) {
        this.todos = this.todos.filter(x => x.id != id)
        this._commit(this.todos)
    }
}
// ----------------------------------------------------------------------------------------------------
class View {
    constructor(key) {
        this.content = this.getElement('.content')
        this._temporaryTodoText
        this.key = key
    }
    createCard(key) {
        this.content.append(this.createElement("div", `card-${key}`));
        this.card = this.getElement(`.card-${key}`)
        this.topLine = this.createElement("div", "topLine-Class")

        this.cTitle = this.createElement("div", "cTitle-Class")
        this.cTitle.textContent = `Todo List ${key}`
        this.removeCardBtn = this.createElement('button', 'removeCardBtn-Class')
        this.removeCardBtn.textContent = "X"
        this.topLine.append(this.cTitle, this.removeCardBtn)

        this.card.append(this.topLine)

        this.form = this.createElement('form', 'form-Class')

        this.input = this.createElement('input', 'input-Class')
        this.input.type = 'text'
        this.input.autocomplete = "off"
        this.input.placeholder = 'Add task..'
        this.input.name = 'todo'

        this.addTodoBtn = this.createElement('button', 'addTodoBtn-Class');
        this.addTodoSvg = this.createElement("img", "addTodoSvg-Class");
        this.addTodoSvg.src = "img/addTodo.svg";
        this.addTodoBtn.append(this.addTodoSvg);

        this.todoList = this.createElement('ul', 'todoList-Class')

        this.form.append(this.input, this.addTodoBtn)

        this.card.appendChild(this.form, this.todoList)


    }
    renderTodos = (key, todos) => {
        if (!this.getElement(`.card-${key}`))
            this.createCard(key)

        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild)
        }
        if (todos.length === 0) {
            const nothingTodo = this.createElement('img', "nothingTodo-Class")
            nothingTodo.src = 'img/nothingTodo.svg'
            this.todoList.append(nothingTodo)
        }
        else {
            todos.forEach(todo => {
                const li = this.createElement('li')
                li.id = todo.id

                const cbcontainer = this.createElement("label", "cbcontainer")
                const checkbox = this.createElement('input', "checkbox-Class")
                checkbox.type = 'checkbox'
                const checkmark = this.createElement("span", "checkmark")
                checkbox.checked = todo.complete
                cbcontainer.append(checkbox, checkmark);

                const span = this.createElement('span')
                span.contentEditable = true
                span.classList.add('editable')

                if (todo.complete) {
                    const strike = this.createElement('s')
                    strike.textContent = todo.text
                    span.append(strike)
                }
                else {
                    span.textContent = todo.text
                }

                const deleteButton = this.createElement('img', 'delete')
                deleteButton.src = "img/delete.svg";
                li.append(cbcontainer, span, deleteButton)

                this.todoList.append(li)
                this.card.appendChild(this.todoList)
            })
        }

        this._initLocalListeners()
    }
    get _todoText() {
        return this.input.value
    }
    _resetInput() {
        this.input.value = ''
    }
    createElement(tag, className) {
        const element = document.createElement(tag)
        if (className) element.classList.add(className)
        return element;
    }
    getElement(selector) {
        const element = document.querySelector(selector)
        return element;
    }
    _initLocalListeners() {

        this.todoList.addEventListener('input', event => {
            if (event.target.className === 'editable') {
                this._temporaryTodoText = event.target.innerText
            }
        })
    }
    bindRemoveCard() {
        this.topLine.addEventListener('click', event => {
            if (event.target.className === 'removeCardBtn-Class') {
                const cardId = parseInt(this.key)
                localStorage.removeItem(`${cardId}`)
                let parent = document.getElementsByClassName("content")[0]
                parent.removeChild(document.getElementsByClassName(`card-${cardId}`)[0])
            }
        })
    }

    bindAddTodo(handler) {
        this.form.addEventListener('submit', event => {
            event.preventDefault()

            if (this._todoText) {
                handler(this._todoText)
                this._resetInput()
            }
        })
    }
    bindDeleteTodo(handler) {
        this.todoList.addEventListener('click', event => {
            if (event.target.className === 'delete') {
                const id = parseInt(event.target.parentElement.id)
                handler(id)
            }
        })
    }
    bindToggleTodo(handler) {
        this.todoList.addEventListener('click', event => {
            if (event.target.type === 'checkbox') {
                const id = parseInt(event.target.parentElement.parentElement.id)
                console.log(event.target.parentElement.parentElement.id);
                handler(id)
            }
        })
    }
    bindEditTodo(handler) {
        this.todoList.addEventListener('focusout', event => {
            if (this._temporaryTodoText) {
                const id = parseInt(event.target.parentElement.id)
                handler(id, this._temporaryTodoText)
                this._temporaryTodoText = ''
            }
        })
    }
}
// --------------------------------------------------------------------------------------------------------------------------------  
class Controller {
    constructor(key, model, view) {
        this.key = key
        this.model = model
        this.view = view
        this.pmb()
        this.view.bindAddTodo(this.handleAddTodo)
        this.view.bindDeleteTodo(this.handleDeleteTodo)
        this.view.bindToggleTodo(this.handleToggleTodo)
        this.view.bindEditTodo(this.handleEditTodo)
        this.view.bindRemoveCard()
    }
    pmb() {
        this.view.renderTodos(this.key, this.model.todos);
    }
    handleAddTodo = todoText => {
        this.model.addTodo(todoText)
    }
    handleEditTodo = (id, todoText) => {
        this.model.editTodo(id, todoText)
    }
    handleDeleteTodo = id => {
        this.model.deleteTodo(id)
    }
    handleToggleTodo = id => {
        this.model.toggleTodo(id)
    }
}

findLargestKey = () => {
    let largestKey = parseInt(0);
    let currentKey;
    for (let key = 0; key < localStorage.length; ++key) {
        currentKey = parseInt(localStorage.key(key));
        largestKey = (currentKey >= largestKey) ? currentKey : largestKey;
    }
    return largestKey;
}
renderAll = () => {
    for (let key = 0; key < Keys; ++key) {
        let currentKey = (localStorage.key(key));
        arrayOfObjects[currentKey] = new Controller(currentKey, new Model(currentKey), new View(currentKey));
    }
}
renderAll()


let majorBtn = document.querySelector(".majorBtn")
majorBtn.addEventListener('click', e => {
    let currentKey = findLargestKey();
    ++currentKey;
    arrayOfObjects[currentKey] = new Controller(currentKey, new Model(currentKey), new View(currentKey));
})
