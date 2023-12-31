import { Project } from './projects';

const storage = {
    saveProject(project) {
        localStorage.setItem(JSON.stringify(project.id), JSON.stringify(project));
    },
    deleteTodo(todoId, projectId) {
        let project = this.getProject(projectId);
        let discardedTodos = [];
        project.todos.forEach(e => {
            if (e.id == todoId) {
                discardedTodos = project.todos.splice(project.todos.indexOf(e), 1);
            }
        });
        let freshProject = new Project(project.name, project.notes, project.id, project.todos)
        storage.saveProject(freshProject)
    },
    deleteProject (projectId) {
        localStorage.removeItem(projectId);
    },
    createDefaultProject() {
        if (Object.keys(localStorage).includes('"defaultProject"')) {
            return;
        } else {
            let defaultProject = new Project('defaultProject', '', 'defaultProject');
        }
    },
    getProject(id) {
        function isNumeric(value) {
            return /^-?\d+$/.test(value);
        }
        let project = "";
        if (isNumeric(id)) {
            project = JSON.parse(localStorage.getItem(id));
        } else {
            project = JSON.parse(localStorage.getItem(`"${id}"`))
        }
        return project;
    },
    getTodo(id, projectId) {
        let project = this.getProject(projectId);
        let todo = null;
        project.todos.forEach((e) => {
            if (e.id == id) {
                todo = e;
            }
        })
        return todo;
    }
}

export {storage};