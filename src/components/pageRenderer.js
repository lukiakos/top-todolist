import { parseISO, format, isSameWeek } from 'date-fns';
import { storage } from './storage';
import { TodoManager } from './todos';
import { ProjectManager } from './projects';
import DeleteImage from '../images/delete.svg';
import Arrow from '../images/arrow.svg';

export const UI = {
    initialLoad() { // initial page load
        storage.createDefaultProject();
        UI.loadSideBar();
        UI.loadProjectList();
        UI.loadAllTasks();
        
    },
    loadSideBar() {
        const content = document.getElementById('content');
        const sideBarDiv = document.createElement('div');
        sideBarDiv.id = 'sidebar';
        content.prepend(sideBarDiv);

        const title = document.createElement('h1');
        title.id = 'title';
        title.textContent = 'TASKMASTER';
        sideBarDiv.appendChild(title);

        const homeBtn = document.createElement('h3');
        homeBtn.id = 'homeBtn';
        homeBtn.textContent = 'Home';
        homeBtn.classList.add('sidebarElement');
        homeBtn.addEventListener('click', () => {
            this.loadAllTasks();
        });
        sideBarDiv.appendChild(homeBtn);

        const todayBtn = document.createElement('h3');
        todayBtn.id = 'todayBtn';
        todayBtn.textContent = 'Today';
        todayBtn.classList.add('sidebarElement');
        todayBtn.addEventListener('click', () => {
            this.loadTodaysTasks();
        })
        sideBarDiv.appendChild(todayBtn);

        const thisWeekBtn = document.createElement('h3');
        thisWeekBtn.id = 'thisWeekBtn';
        thisWeekBtn.textContent = 'This week';
        thisWeekBtn.classList.add('sidebarElement');
        thisWeekBtn.addEventListener('click', () => {
            this.loadThisWeeksTasks();
        })
        sideBarDiv.appendChild(thisWeekBtn);

        const projectsWrapper = document.createElement('div');
        projectsWrapper.id = 'projectsWrapper';
        sideBarDiv.appendChild(projectsWrapper);

        const projectsBtn = document.createElement('h3');
        projectsBtn.id = 'projectsBtn';
        projectsBtn.textContent = 'Projects';
        projectsBtn.classList.add('sidebarElement');
        projectsBtn.addEventListener('click', () => {
            UI.toggleProjectList();
        })
        projectsWrapper.appendChild(projectsBtn);

        const projectsArrow = document.createElement('img');
        projectsArrow.id = 'projectsArrow';
        projectsArrow.classList.add('arrow');
        projectsArrow.classList.add('up');
        projectsArrow.src = Arrow;
        projectsArrow.alt = '';
        projectsArrow.addEventListener('click', () => {
            UI.toggleProjectList();
        });
        projectsWrapper.appendChild(projectsArrow);

        const projectElementWrapper = document.createElement('div');
        projectElementWrapper.id = 'projectElementWrapper';
        sideBarDiv.appendChild(projectElementWrapper);
        const sideBarCloserBtn = document.createElement('div');
        sideBarCloserBtn.id = 'sideBarCloserBtn';
        sideBarDiv.appendChild(sideBarCloserBtn);
        const closerArrow = document.createElement('img');
        closerArrow.classList.add('arrow');
        closerArrow.classList.add('left');
        closerArrow.src = Arrow;
        closerArrow.alt = '';
        closerArrow.addEventListener('click', () => {
            UI.toggleSidebar();
        });
        sideBarCloserBtn.appendChild(closerArrow);

    },
    toggleSidebar() { // toggles the sidebar
        const sideBar = document.getElementById('sidebar');
        if (sideBar.dataset.hidden != 'true') {
            sideBar.style.width = 0;
            sideBar.childNodes.forEach(node => {
                if (node.style && node.id != 'sideBarCloserBtn') {
                    node.style.display = 'none';
                } else {
                    if (node.style) {
                        node.children[0].classList.remove('left');
                        node.children[0].classList.add('right');
                        sideBar.dataset.hidden = true;
                    } else {
                        return
                    }
                }
            })
        } else {
            sideBar.style.width = '300px';
            sideBar.childNodes.forEach(node => {
                if (node.style && node.id != 'sideBarCloserBtn') {
                    if (node.id =='projectsWrapper' || 'projectElementWrapper') {
                        node.style.display = 'flex';
                    } else {
                        node.style.display = 'block';
                    }
                } else {
                    if (node.style) {
                        node.children[0].classList.remove('right');
                        node.children[0].classList.add('left');
                        sideBar.dataset.hidden = false;
                    } else {
                        return
                    }
                }
            })
        }
    },
    toggleProjectList() { // toggles whether the projects show up on the sidebar or not
        const projectToggleText = document.getElementById('projectsBtn');
        const projectToggleBtn = document.getElementById('projectsArrow');
        let projectElements = document.querySelectorAll('.projectElement');
        if (projectToggleText.dataset.hidden != 'true') {
            projectElements.forEach( e => {
                e.style.display = 'none';
            });
            projectToggleBtn.classList.remove('up');
            projectToggleBtn.classList.add('down');
            projectToggleText.dataset.hidden = true;
        } else {
            projectElements.forEach( e => {
                e.style.display = 'block';
            });
            projectToggleBtn.classList.add('up');
            projectToggleBtn.classList.remove('down');
            projectToggleText.dataset.hidden = false;
        }
    
    },
    loadProjectList() { // loads the projects list on the sidebar
        const projectElementWrapper = document.getElementById('projectElementWrapper');
        projectElementWrapper.innerHTML = '';
        let projects = Object.values(localStorage)
        let newProjectButton = document.createElement('p');
        newProjectButton.id = 'newProjectButton';
        newProjectButton.textContent = '+ Create New Project';
        newProjectButton.classList.add('projectElement');
        newProjectButton.addEventListener('click', this.handleNewProjectButton);
        projectElementWrapper.appendChild(newProjectButton);
        projects.forEach(element => {
            let e = JSON.parse(element)
            if (e.id == 'defaultProject') {return}
            const projectListDiv = document.createElement('div');
            projectListDiv.classList.add('projectListDiv');
            projectElementWrapper.appendChild(projectListDiv);
            const newProject = document.createElement('p');
            newProject.textContent = e.name;
            newProject.dataset.projectId = e.id;
            newProject.addEventListener('click', function() {
                UI.loadProjectPage(e.id);
            })
            newProject.classList.add('projectElement');
            const deleteImage = document.createElement('img');
            deleteImage.src = DeleteImage;
            deleteImage.classList.add('deleteImage');
            deleteImage.classList.add('projectElement');
            deleteImage.addEventListener('click', () => {
                UI.handleProjectDelete(e.id);
            })
            projectListDiv.appendChild(newProject);
            projectListDiv.appendChild(deleteImage);
        });
    },
    loadProjectPage(id) { // load a specific project's todos
        UI.clearMainPage();
        const mainpage = document.getElementById('mainpage');
        mainpage.classList.remove(...mainpage.classList);
        mainpage.dataset.projectId = id;
        mainpage.classList.add('projectPage');
        if (id == 'defaultProject') {
            this.loadAllTasks();
            return;
        }
        let projects = Object.values(localStorage);
        let todos = [];
        let projectName = "";
        projects.forEach(element => {
            let e = JSON.parse(element);
            if (e.id == id) {
                projectName = e.name;
                todos.push(e.todos);
            }
        });
        UI.renderMainPage(projectName, id)        
        todos.forEach(element => {
            element.forEach(e => {
                this.loadTask(e);
            })
        })
        const editProjectButton = document.getElementById('editProject');
        editProjectButton.addEventListener('click', handleEditProjectClick, false);
        function handleEditProjectClick(e) {
            UI.handleEditProject(e.target.dataset.projectId);
        }
        const projectDescriptionButton = document.getElementById('projectDescription');
        projectDescriptionButton.addEventListener('click', handleProjectDescriptionClick, false);
        function handleProjectDescriptionClick(e) {
            UI.showProjectDescription(e.target.dataset.projectId);
        }
    },
    loadAllTasks() { // loads all tasks to the grid from all projects
        UI.clearMainPage();
        UI.renderMainPage('allTasks')
        const mainpage = document.getElementById('mainpage');
        mainpage.classList.remove(...mainpage.classList);
        mainpage.classList.add('allTasksPage');
        let projects = Object.values(localStorage);
        let todos = [];
        projects.forEach(element => { // put all todos in one array (todo lists the projects contain)
            let e = JSON.parse(element);
            todos.push(e.todos);
        })
        todos.forEach(element => { //render the rows
            element.forEach(e => {
                this.loadTask(e);
            })
        })
    },
    createPageLayout() {
            const mainpage = document.getElementById('mainpage');
            const mainTitle = document.createElement('h1');
            mainTitle.id = 'mainTitle';
            mainpage.appendChild(mainTitle);
            const gridWrapper = document.createElement('div');
            gridWrapper.id = 'gridWrapper';
            mainpage.appendChild(gridWrapper);
            const gridFirstRow = document.createElement('div');
            gridFirstRow.classList.add('gridElement');
            gridFirstRow.classList.add('titleRow');
            gridWrapper.appendChild(gridFirstRow);
            const checkBoxColumn = document.createElement('div');
            checkBoxColumn.classList.add('gridTextElement');
            gridFirstRow.appendChild(checkBoxColumn);
            const titleColumn = document.createElement('div');
            titleColumn.classList.add('gridTextElement');
            titleColumn.textContent = 'title';
            gridFirstRow.appendChild(titleColumn);
            const descriptionColumn = document.createElement('div');
            descriptionColumn.classList.add('gridTextElement');
            descriptionColumn.textContent = 'description';
            gridFirstRow.appendChild(descriptionColumn);
            const dueDateColumn = document.createElement('div');
            dueDateColumn.classList.add('gridTextElement');
            dueDateColumn.textContent = 'due date';
            gridFirstRow.appendChild(dueDateColumn);
            const priorityColumn = document.createElement('div');
            priorityColumn.classList.add('gridTextElement');
            priorityColumn.textContent = 'priority';
            gridFirstRow.appendChild(priorityColumn);
            const notesColumn = document.createElement('div');
            notesColumn.classList.add('gridTextElement');
            notesColumn.textContent = 'notes';
            gridFirstRow.appendChild(notesColumn);
            const editColumn = document.createElement('div');
            editColumn.classList.add('gridTextElement');
            editColumn.textContent = 'edit';
            gridFirstRow.appendChild(editColumn);
            const deleteColumn = document.createElement('div');
            deleteColumn.classList.add('gridTextElement');
            deleteColumn.textContent = 'delete';
            gridFirstRow.appendChild(deleteColumn);
    },
    loadTodaysTasks() {
        UI.clearMainPage();
        UI.createPageLayout();
        const mainpage = document.getElementById('mainpage');
        mainpage.classList.remove(...mainpage.classList);
        mainpage.classList.add('todayPage');
        const mainTitle = document.getElementById('mainTitle');
        mainTitle.textContent = "Today's tasks";
        let projects = Object.values(localStorage);
        const todaysDate = format(new Date(), 'yyyy-MM-dd')
        projects.forEach((element) => {
            let e = JSON.parse(element);
            e.todos.forEach((todo) => {
                if (todo.dueDate == todaysDate) {
                    this.loadTask(todo);
                }
            })
        })
    },
    loadThisWeeksTasks() {
        UI.clearMainPage();
        UI.createPageLayout();
        const mainpage = document.getElementById('mainpage');
        mainpage.classList.remove(...mainpage.classList);
        mainpage.classList.add('thisWeekPage');
        const mainTitle = document.getElementById('mainTitle');
        mainTitle.textContent = "This week's tasks";
        let projects = Object.values(localStorage);
        const todaysDate = format(new Date(), 'yyyy-MM-dd')
        projects.forEach((element) => {
            let e = JSON.parse(element);
            e.todos.forEach((todo) => {
                if (isSameWeek(parseISO(todaysDate), parseISO(todo.dueDate))) {
                    this.loadTask(todo);
                }
            })
        })
    },
    handleEdit(e) { // handles edit button press
        this.renderAddTaskPopUp(e);
        // initialise fields
        const todoTitle = document.getElementById('addTaskTitle');
        const titleInput = document.getElementById('titleInput');
        const descInput = document.getElementById('descInput');
        const dueDateInput = document.getElementById('dueDateInput');
        const addTaskButton = document.getElementById('addTaskButtonOnPopUp');
        /// DO PRIORITY !!!!!!
        const priorityInputLow = document.getElementById('priorityInputLow');
        const priorityInputMed = document.getElementById('priorityInputMed');
        const priorityInputHigh = document.getElementById('priorityInputHi');
        /// do something about the project dropdown
        const notesInput = document.getElementById('notesInput');
        // fill the popup with data from localstorage for the todo
        let projectId = e.target.dataset.projectId;
        let todoId = e.target.dataset.todoId;
        let todo = storage.getTodo(todoId, projectId);
        todoTitle.textContent = `Editing ${todo.title}`;
        titleInput.value = todo.title;
        descInput.value = todo.description;
        dueDateInput.value = todo.dueDate;
        notesInput.value = todo.notes;
        // priority
        if (todo.priority == 'low') {
            priorityInputLow.checked = true;
        } else if (todo.priority == 'hi') {
            priorityInputHigh.checked = true;
        } else if (todo.priority == 'med'){
            priorityInputMed.checked = true;
        }
        const buttonDiv = document.getElementById('addTaskButtonDiv');
        const saveEditButton = document.createElement('button');
        saveEditButton.textContent = 'SAVE EDIT';
        saveEditButton.id = 'saveEditTaskButton'
        saveEditButton.classList.add('button');
        saveEditButton.classList.add('greenBtn');
        saveEditButton.type = 'button';
        saveEditButton.addEventListener('click', handleSaveClick, false);
        function handleSaveClick() {
            if (document.forms.popUpGrid.checkValidity()) {
                UI.handleSaveTaskEdit(document.forms.popUpGrid, projectId, todoId);
            }
        }
        buttonDiv.removeChild(addTaskButton);
        buttonDiv.appendChild(saveEditButton);
    },
    handleDelete(todoId, projectId) { //handles delete todo button press
        storage.deleteTodo(todoId, projectId);
        UI.reloadCurrentPage();
    },
    reloadCurrentPage() { // gets the current page and reloads it
        const mainpage = document.querySelector('#mainpage');
        if (mainpage.classList.contains('allTasksPage')) {
            UI.loadAllTasks();
        } else if (mainpage.classList.contains('todayPage')) {
            UI.loadTodaysTasks();
        } else if (mainpage.classList.contains('thisWeekPage')) {
            UI.loadThisWeeksTasks();
        } else if (mainpage.classList.contains('projectPage')) {
            const projectId = mainpage.dataset.projectId;
            UI.loadProjectPage(projectId);
        }
    },
    loadTask(e) { //loads one specific task to the grid (called in a loop)
        let gridElement = document.createElement('div');
        gridElement.classList.add('gridElement');
        gridWrapper.appendChild(gridElement);
        let checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.dataset.todoId = e.id;
        gridElement.appendChild(checkBox);
        let title = document.createElement('div');
        title.classList.add('gridTextElement');
        title.textContent = e.title;
        gridElement.appendChild(title);
        let description = document.createElement('div');
        description.classList.add('gridTextElement');
        description.textContent = e.description;
        gridElement.appendChild(description);
        let dueDate = document.createElement('div');
        dueDate.classList.add('gridTextElement');
        dueDate.textContent = e.dueDate;
        gridElement.appendChild(dueDate);
        let priority = document.createElement('div');
        priority.classList.add('gridTextElement');
        priority.textContent = e.priority;
        gridElement.appendChild(priority);
        let notes = document.createElement('p');
        notes.classList.add('gridTextElement');
        notes.textContent = e.notes;
        gridElement.appendChild(notes);
        let editBtn = document.createElement('div');
        editBtn.classList.add('gridTextElement');
        editBtn.textContent = 'edit >';
        editBtn.dataset.todoId = e.id;
        editBtn.dataset.projectId = e.projectId;
        editBtn.addEventListener('click', (e) => {
            UI.handleEdit(e);
        })
        gridElement.appendChild(editBtn);
        let deleteBtn = document.createElement('div');
        deleteBtn.textContent = 'delete';
        deleteBtn.classList.add('gridTextElement');
        deleteBtn.dataset.todoId = e.id;
        deleteBtn.dataset.projectId = e.projectId;
        deleteBtn.addEventListener('click', (e) => {
            UI.handleDelete(e.target.dataset.todoId, e.target.dataset.projectId);
        });
        gridElement.appendChild(deleteBtn);
    },
    renderAddTaskPopUp(clickEvent) {
        UI.clearMainPage();
        let projectId = clickEvent.target.dataset.projectId;
        UI.renderPopUp();

        //render title input and label
        const titleLabel = document.createElement('label');
        titleLabel.textContent = 'Title';
        titleLabel.htmlFor = 'titleInput';
        titleLabel.id = 'titleLabel';
        titleLabel.classList.add('taskLeftColumn');
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.id = 'titleInput';
        titleInput.required = true;
        titleInput.placeholder = 'Put your task title here...';
        titleInput.classList.add('taskRightColumn');
        titleInput.classList.add('textInput');
        popUpGrid.appendChild(titleLabel);
        popUpGrid.appendChild(titleInput);

        // render description input and label
        const descLabel = document.createElement('label');
        descLabel.textContent = 'Short description';
        descLabel.htmlFor = 'descInput';
        descLabel.id = 'descLabel';
        descLabel.classList.add('taskLeftColumn');
        const descInput = document.createElement('input');
        descInput.type = 'text';
        descInput.id = 'descInput';
        descInput.required = true;
        descInput.placeholder = 'Write your short description here';
        descInput.classList.add('taskRightColumn');
        descInput.classList.add('textInput');
        popUpGrid.appendChild(descLabel);
        popUpGrid.appendChild(descInput);

        // render duedate input and label
        const dueDateLabel = document.createElement('label');
        dueDateLabel.textContent = 'Due date';
        dueDateLabel.htmlFor = 'dueDateInput';
        dueDateLabel.id = 'dueDateLabel';
        dueDateLabel.classList.add('taskLeftColumn');
        const dueDateInput = document.createElement('input');
        dueDateInput.type = 'date';
        dueDateInput.id = 'dueDateInput';
        dueDateInput.required = true;
        dueDateInput.classList.add('taskRightColumn');
        popUpGrid.appendChild(dueDateLabel);
        popUpGrid.appendChild(dueDateInput);

        (function renderPriorityInputs() {
            // render priority inputs and labels
            const priorityLabel = document.createElement('label');
            priorityLabel.textContent = 'Priority';
            priorityLabel.htmlFor = 'priorityInput';
            priorityLabel.id = 'priorityLabel';
            priorityLabel.classList.add('taskLeftColumn');

            const priorityForm = document.createElement('div');
            priorityForm.id = 'priorityDiv'

            const priorityLow = document.createElement('div');
            const priorityInputLow = document.createElement('input');
            priorityInputLow.type = 'radio';
            priorityInputLow.name = 'priority';
            priorityInputLow.value = 'low';
            priorityInputLow.id = 'priorityInputLow';
            priorityInputLow.classList.add('taskRightColumn');
            const priorityInputLowLabel = document.createElement('label');
            priorityInputLowLabel.htmlFor = 'priorityInputLow';
            priorityInputLowLabel.textContent = 'low';

            const priorityMed = document.createElement('div');
            const priorityInputMed = document.createElement('input');
            priorityInputMed.type = 'radio';
            priorityInputMed.name = 'priority';
            priorityInputMed.value = 'med';
            priorityInputMed.id = 'priorityInputMed';
            priorityInputMed.classList.add('taskRightColumn');
            const priorityInputMedLabel = document.createElement('label');
            priorityInputMedLabel.htmlFor = 'priorityInputMed';
            priorityInputMedLabel.textContent = 'medium';

            const priorityHigh = document.createElement('div');
            const priorityInputHi = document.createElement('input');
            priorityInputHi.type = 'radio';
            priorityInputHi.name = 'priority';
            priorityInputHi.value = 'hi';
            priorityInputHi.id = 'priorityInputHi';
            priorityInputHi.classList.add('taskRightColumn');
            const priorityInputHiLabel = document.createElement('label');
            priorityInputHiLabel.htmlFor = 'priorityInputHi';
            priorityInputHiLabel.textContent = 'high';

            popUpGrid.appendChild(priorityLabel);
            popUpGrid.appendChild(priorityForm);
            priorityLow.appendChild(priorityInputLow);
            priorityLow.appendChild(priorityInputLowLabel);
            priorityForm.appendChild(priorityLow);
            priorityMed.appendChild(priorityInputMed);
            priorityMed.appendChild(priorityInputMedLabel);
            priorityForm.appendChild(priorityMed);
            priorityHigh.appendChild(priorityInputHi);
            priorityHigh.appendChild(priorityInputHiLabel);
            priorityForm.appendChild(priorityHigh);
        })();

        // render project choice 
        const projectLabel = document.createElement('label');
        projectLabel.textContent = 'Project';
        projectLabel.id = 'projectLabel';
        projectLabel.classList.add('taskLeftColumn')
        popUpGrid.appendChild(projectLabel);

        const projectSelect = document.createElement('select');
        projectSelect.name = 'projects';
        projectSelect.id = 'projectSelect';
        popUpGrid.appendChild(projectSelect);

        let newProject = document.createElement('option');
        newProject.textContent = 'No Project (only visible in all tasks)';
        newProject.value = 'defaultProject';
        projectSelect.appendChild(newProject);

        let projects = Object.values(localStorage)
        projects.forEach(element => {
            let e = JSON.parse(element)
            if (e.id == 'defaultProject') {return}
            newProject = document.createElement('option');
            newProject.textContent = e.name;
            newProject.value = e.id;
            if (e.id == projectId) {
                newProject.selected = 'selected';
            }
            projectSelect.appendChild(newProject);
        });

        // render notes
        const notesLabel = document.createElement('label');
        notesLabel.textContent = 'Notes';
        notesLabel.htmlFor = 'notesInput';
        notesLabel.id = 'notesLabel';
        notesLabel.classList.add('taskLeftColumn');
        const notesInput = document.createElement('textArea');
        notesInput.id = 'notesInput';
        notesInput.required = false;
        notesInput.placeholder = 'Write your notes here';
        notesInput.classList.add('textInput');
        popUpGrid.appendChild(notesLabel);
        popUpGrid.appendChild(notesInput);


        //render buttons
        //render button div
        const addTaskButtonDiv = document.createElement('div');
        addTaskButtonDiv.id = 'addTaskButtonDiv';
        popUpGrid.appendChild(addTaskButtonDiv);
        //clear button
        const clearButton = document.createElement('input');
        clearButton.type = 'reset';
        clearButton.value = 'CLEAR';
        clearButton.id = 'clearButton'
        clearButton.classList.add('button');
        clearButton.classList.add('greenBtn');
        addTaskButtonDiv.appendChild(clearButton);
        //cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'CANCEL';
        cancelButton.id = 'cancelButton'
        cancelButton.classList.add('button');
        cancelButton.classList.add('greenBtn');
        cancelButton.addEventListener('click', () => {
            this.loadProjectPage(projectId)
        });
        addTaskButtonDiv.appendChild(cancelButton);
        //cancel button
        const addTaskButton = document.createElement('button');
        addTaskButton.textContent = 'ADD TASK';
        addTaskButton.id = 'addTaskButtonOnPopUp'
        addTaskButton.classList.add('button');
        addTaskButton.classList.add('greenBtn');
        addTaskButton.type = 'button';
        addTaskButton.addEventListener('click', handleAddTaskClick, false);
        function handleAddTaskClick() {
            if (document.forms.popUpGrid.checkValidity()) {
                UI.handleAddTask(document.forms.popUpGrid);
            }
        }
        addTaskButtonDiv.appendChild(addTaskButton);
    },
    renderPopUp() {
        const mainpage = document.querySelector('#mainpage');
        const taskPopUp = document.createElement('div');
        taskPopUp.id = 'addTaskBackGround';
        mainpage.appendChild(taskPopUp);

        const addTaskTitle = document.createElement('h1');
        addTaskTitle.textContent = 'add new task';
        addTaskTitle.id = 'addTaskTitle';
        taskPopUp.appendChild(addTaskTitle);

        const popUpGrid = document.createElement('form');
        popUpGrid.id = 'popUpGrid';
        taskPopUp.appendChild(popUpGrid);
    },
    clearMainPage() { // clears the main page
        const mainpage = document.getElementById('mainpage');
        mainpage.innerHTML = '';
    },
    renderMainPage(name, projectId = null) { // renders the whole main page
        const mainpage = document.getElementById('mainpage');
        const mainTitle = document.createElement('h1');
        if(name == 'allTasks') {
            mainTitle.textContent = 'All tasks';
        } else {
            mainTitle.textContent = name;
        }
        mainpage.appendChild(mainTitle);
        const buttonDiv = document.createElement('div');
        if (name == 'allTasks') {
            buttonDiv.classList.remove('projectPage');
            buttonDiv.classList.add('allTasksPage');
        } else {
            buttonDiv.classList.remove('allTasksPage');
            buttonDiv.classList.add('projectPage');
        }
        buttonDiv.id = 'buttonDiv';
        mainpage.appendChild(buttonDiv);
        function renderTaskButton() {
            const addTaskButton = document.createElement('button');
            addTaskButton.classList.add('addTaskBtn');
            addTaskButton.classList.add('greenBtn');
            addTaskButton.id = 'addTask';
            addTaskButton.textContent = 'Add Task';
            if (projectId !== null) {
                addTaskButton.dataset.projectId = projectId;
            } else {
                addTaskButton.dataset.projectId = 'defaultProject';
            }
            addTaskButton.onclick = (e) => {UI.renderAddTaskPopUp(e)};
            buttonDiv.appendChild(addTaskButton);
        };
        if (buttonDiv.classList.contains('projectPage')) {
            const editProjectButton = document.createElement('button');
            editProjectButton.classList.add('projectBtn');
            editProjectButton.classList.add('greenBtn');
            editProjectButton.id = 'editProject';
            editProjectButton.textContent = 'Edit Project';
            editProjectButton.onclick = () => {UI.handleProjectEdit};
            editProjectButton.dataset.projectId = projectId;
            buttonDiv.appendChild(editProjectButton);
            const projectDescriptionButton = document.createElement('button');
            projectDescriptionButton.classList.add('projectBtn');
            projectDescriptionButton.classList.add('greenBtn');
            projectDescriptionButton.id = 'projectDescription';
            projectDescriptionButton.textContent = 'Project Description';
            projectDescriptionButton.dataset.projectId = projectId;
            projectDescriptionButton.onclick = () => {UI.showProjectDescription};
            buttonDiv.appendChild(projectDescriptionButton);
            renderTaskButton();
        } else {
            renderTaskButton();
        }
        const gridWrapper = document.createElement('div');
        gridWrapper.id = 'gridWrapper';
        mainpage.appendChild(gridWrapper);
        const gridFirstRow = document.createElement('div');
        gridFirstRow.classList.add('gridElement');
        gridFirstRow.classList.add('titleRow');
        gridWrapper.appendChild(gridFirstRow);
        const checkBoxColumn = document.createElement('div');
        checkBoxColumn.classList.add('gridTextElement');
        gridFirstRow.appendChild(checkBoxColumn);
        const titleColumn = document.createElement('div');
        titleColumn.classList.add('gridTextElement');
        titleColumn.textContent = 'title';
        gridFirstRow.appendChild(titleColumn);
        const descriptionColumn = document.createElement('div');
        descriptionColumn.classList.add('gridTextElement');
        descriptionColumn.textContent = 'description';
        gridFirstRow.appendChild(descriptionColumn);
        const dueDateColumn = document.createElement('div');
        dueDateColumn.classList.add('gridTextElement');
        dueDateColumn.textContent = 'due date';
        gridFirstRow.appendChild(dueDateColumn);
        const priorityColumn = document.createElement('div');
        priorityColumn.classList.add('gridTextElement');
        priorityColumn.textContent = 'priority';
        gridFirstRow.appendChild(priorityColumn);
        const notesColumn = document.createElement('div');
        notesColumn.classList.add('gridTextElement');
        notesColumn.textContent = 'notes';
        gridFirstRow.appendChild(notesColumn);
        const editColumn = document.createElement('div');
        editColumn.classList.add('gridTextElement');
        editColumn.textContent = 'edit';
        gridFirstRow.appendChild(editColumn);
        const deleteColumn = document.createElement('div');
        deleteColumn.classList.add('gridTextElement');
        deleteColumn.textContent = 'delete';
        gridFirstRow.appendChild(deleteColumn);
    },
    handleAddTask(form) {
        let todoTitle = form.titleInput.value;
        let todoDescription = form.descInput.value;
        let todoDueDate = form.dueDateInput.value;
        let todoPriority = "";
        let priorityRadios = form.priority;
        priorityRadios.forEach(e => {
            if (e.checked) {
                todoPriority = e.value;
            }
        })
        let todoNotes = form.notesInput.value;
        let projectId = form.projectSelect.value;
        let oldProject = storage.getProject(projectId);
        let newTodo = TodoManager.createTodo(todoTitle, todoDueDate, projectId, todoDescription, todoPriority, todoNotes);
        oldProject.todos.push(newTodo);
        ProjectManager.createProject(oldProject.name, oldProject.notes, oldProject.id, oldProject.todos);
        this.loadProjectPage(projectId)
    },
    handleSaveTaskEdit(form, projectId, todoId) {
        let todoTitle = form.titleInput.value;
        let todoDescription = form.descInput.value;
        let todoDueDate = form.dueDateInput.value;
        let todoPriority = "";
        let priorityRadios = form.priority;
        priorityRadios.forEach(e => {
            if (e.checked) {
                todoPriority = e.value;
            }
        })
        let todoNotes = form.notesInput.value;
        let oldProject = storage.getProject(projectId);
        let newTodo = TodoManager.createTodo(todoTitle, todoDueDate, projectId, todoDescription, todoPriority, todoNotes);
        oldProject.todos.push(newTodo);
        ProjectManager.createProject(oldProject.name, oldProject.notes, oldProject.id, oldProject.todos);
        storage.deleteTodo(todoId, projectId);
        this.loadProjectPage(projectId)
    },
    handleNewProjectButton() {
        UI.clearMainPage();
        UI.renderPopUp();
        const todoTitle = document.getElementById('addTaskTitle');
        const popUpGrid = document.getElementById('popUpGrid');
        popUpGrid.id = 'projectPopUpGrid';
        todoTitle.textContent = 'Create New Project';
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Name';
        nameLabel.htmlFor = 'nameInput';
        popUpGrid.appendChild(nameLabel);
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Type your project name here...';
        nameInput.id = 'nameInput';
        nameInput.required = true;
        nameInput.classList.add('taskRightColumn');
        nameInput.classList.add('textInput');
        popUpGrid.appendChild(nameInput);

        const notesLabel = document.createElement('label');
        notesLabel.textContent = 'Project Description';
        notesLabel.htmlFor = 'notesInput';
        notesLabel.id = 'notesLabel';
        popUpGrid.appendChild(notesLabel);
        const notesInput = document.createElement('textArea');
        notesInput.placeholder = 'Type a short project description here...';
        notesInput.id = 'notesInput';
        notesInput.classList.add('textInput');
        popUpGrid.appendChild(notesInput);

        const addTaskButtonDiv = document.createElement('div');
        addTaskButtonDiv.id = 'addTaskButtonDiv';
        popUpGrid.appendChild(addTaskButtonDiv);
        //clear button
        const clearButton = document.createElement('input');
        clearButton.type = 'reset';
        clearButton.value = 'CLEAR';
        clearButton.id = 'clearButton'
        clearButton.classList.add('button');
        clearButton.classList.add('greenBtn');
        addTaskButtonDiv.appendChild(clearButton);
        //cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'CANCEL';
        cancelButton.id = 'cancelButton'
        cancelButton.classList.add('button');
        cancelButton.classList.add('greenBtn');
        cancelButton.addEventListener('click', handleCancelButton);
        function handleCancelButton() {
            UI.loadAllTasks();
        }
        addTaskButtonDiv.appendChild(cancelButton);
        //cancel button
        const createProjectButtonOnPopUp = document.createElement('button');
        createProjectButtonOnPopUp.textContent = 'CREATE PROJECT';
        createProjectButtonOnPopUp.id = 'createProjectButtonOnPopUp'
        createProjectButtonOnPopUp.classList.add('button');
        createProjectButtonOnPopUp.classList.add('greenBtn');
        createProjectButtonOnPopUp.type = 'button';
        createProjectButtonOnPopUp.addEventListener('click', handleCreateProjectClick, false);
        function handleCreateProjectClick() {
            if (document.forms.projectPopUpGrid.checkValidity()) {
                UI.handleCreateProject(document.forms.projectPopUpGrid);
            }
        }
        addTaskButtonDiv.appendChild(createProjectButtonOnPopUp);
    },
    handleCreateProject(form) {
        let projectName = form.nameInput.value;
        let projectNotes = form.notesInput.value;
        let project = ProjectManager.createProject(projectName, projectNotes);
        this.loadProjectList();
        this.loadProjectPage(project.id)
    },
    showProjectDescription(projectId) {
        let popUps = document.querySelectorAll('.popup')
        if (popUps.length < 1) {
            const mainPage = document.getElementById('mainpage')
            const project = storage.getProject(projectId);
            const description = project.notes;
            const taskPopUp = document.createElement('div');
            taskPopUp.id = 'descriptionPopUp';
            taskPopUp.classList.add('popup')
            mainPage.appendChild(taskPopUp);
    
            const addTaskTitle = document.createElement('h1');
            addTaskTitle.textContent = `${project.name} description`;
            addTaskTitle.id = 'projectDescriptionTitle';
            taskPopUp.appendChild(addTaskTitle);
    
            const popUpGrid = document.createElement('div');
            popUpGrid.id = 'descriptionPopUpGrid';
            taskPopUp.appendChild(popUpGrid);
            
            const notesInput = document.createElement('textArea');
            notesInput.value = project.notes;
            notesInput.id = 'notesInput';
            notesInput.classList.add('textInput');
            notesInput.disabled = true;
            popUpGrid.appendChild(notesInput);

            const closeButton = document.createElement('button');
            closeButton.textContent = 'CLOSE';
            closeButton.id = 'cancelButton'
            closeButton.classList.add('button');
            closeButton.classList.add('greenBtn');
            closeButton.addEventListener('click', () => {
                mainPage.removeChild(taskPopUp);
            });
            taskPopUp.appendChild(closeButton);
        }
    },
    handleEditProject(projectId) {
        let project = storage.getProject(projectId);
        UI.handleNewProjectButton();
        const title = document.getElementById('addTaskTitle');
        title.textContent = `Edit '${project.name}'`;
        const nameInput = document.getElementById('nameInput');
        nameInput.value = project.name;
        const notesInput = document.getElementById('notesInput');
        notesInput.value = project.notes;
        const oldCancelButton = document.getElementById('cancelButton');
        const createButton = document.getElementById('createProjectButtonOnPopUp')
        const buttonDiv = document.getElementById('addTaskButtonDiv');
        buttonDiv.removeChild(oldCancelButton);
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'CANCEL';
        cancelButton.id = 'cancelButton'
        cancelButton.classList.add('button');
        cancelButton.classList.add('greenBtn');
        cancelButton.addEventListener('click', handleCancelButton);
        function handleCancelButton() {
            UI.loadProjectPage(projectId);
        }
        buttonDiv.appendChild(cancelButton);
        buttonDiv.removeChild(createButton);
        const editProjectButtonOnPopUp = document.createElement('button');
        editProjectButtonOnPopUp.textContent = 'SAVE EDIT';
        editProjectButtonOnPopUp.id = 'createProjectButtonOnPopUp'
        editProjectButtonOnPopUp.classList.add('button');
        editProjectButtonOnPopUp.classList.add('greenBtn');
        editProjectButtonOnPopUp.type = 'button';
        editProjectButtonOnPopUp.addEventListener('click', handleEditProjectClick, false);
        function handleEditProjectClick() {
            if (document.forms.projectPopUpGrid.checkValidity()) {
                UI.saveProjectEdit(document.forms.projectPopUpGrid, Number(projectId));
            }
            else {
                alert('Form cannot be empty!')
            }
        }
        addTaskButtonDiv.appendChild(editProjectButtonOnPopUp);
    },
    saveProjectEdit(form, projectId) {
        let projectName = form.nameInput.value;
        let projectNotes = form.notesInput.value;
        let oldProject = storage.getProject(projectId);
        let todos = oldProject.todos;
        storage.deleteProject(projectId);
        ProjectManager.createProject(projectName, projectNotes, projectId, todos);
        this.loadProjectPage(projectId);
        this.loadProjectList();
    },
    handleProjectDelete(projectId) {
        let popUps = document.querySelectorAll('.popup')
        if (popUps.length < 1) {
            const mainPage = document.getElementById('mainpage')
            const project = storage.getProject(projectId);
            const taskPopUp = document.createElement('div');
            taskPopUp.id = 'deletePopUp';
            taskPopUp.classList.add('popup')
            mainPage.appendChild(taskPopUp);
    
            const addTaskTitle = document.createElement('h1');
            addTaskTitle.textContent = `Are you sure you want to delete the project '${project.name}'?`;
            addTaskTitle.id = 'deleteTitle';
            taskPopUp.appendChild(addTaskTitle);

            const confirmationText = document.createElement('p');
            confirmationText.textContent = `To delete the project, enter '${project.name}' in the field below and press 'DELETE'`
            taskPopUp.appendChild(confirmationText);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.id = 'deleteButton'
            deleteButton.classList.add('button');
            deleteButton.classList.add('greenBtn');
            deleteButton.classList.add('redBtn');
            deleteButton.addEventListener('click', () => {
                if(nameInput.value == project.name) {
                    storage.deleteProject(projectId);
                    UI.loadProjectList();
                    UI.loadAllTasks();
                } else {
                    if (document.getElementById('notMatch') == null) {
                        let notMatch = document.createElement('span');
                        notMatch.id = 'notMatch';
                        notMatch.textContent = 'The confirmation text does not match the project name!'
                        nameInput.after(notMatch);
                    } else {
                        return
                    }
                };
            });
            taskPopUp.appendChild(deleteButton);
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.id = 'deleteNameInput';
            nameInput.classList.add('textInput')
            taskPopUp.appendChild(nameInput);

            const closeButton = document.createElement('button');
            closeButton.textContent = 'CLOSE';
            closeButton.id = 'closeButton'
            closeButton.classList.add('button');
            closeButton.classList.add('greenBtn');
            closeButton.classList.add('redBtn');
            closeButton.addEventListener('click', () => {
                mainPage.removeChild(taskPopUp);
            });
            taskPopUp.appendChild(closeButton);
            

        }
    },
};