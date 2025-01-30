import { Component, OnInit } from '@angular/core';
import { TodoService, Todo } from '../todo.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})

export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  newTodoTitle: string = '';
  isLoading: boolean = false;
  isSearching: boolean = false;
  searchTerm: string = '';

  constructor(
    private todoService: TodoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.isLoading = true;
    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading todos:', error);
        this.router.navigate(['/login']);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  addTodo() {
    if (this.newTodoTitle.trim()) {
      this.isLoading = true;
      const newTodo: Todo = {
        id: Date.now(),
        title: this.newTodoTitle,
        completed: false,
      };
      this.todoService.Todo(newTodo).subscribe({
        next: (todo) => {
          this.todos.push(todo);
          this.newTodoTitle = '';
        },
        error: (error) => {
          console.error('Error adding todo:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  CompleteTodo(todo: Todo) {
    this.isLoading = true;
    const updatedTodo = { ...todo, completed: !todo.completed };
    this.todoService.toggleTodo(todo.id).subscribe({
      next: () => {
        todo.completed = !todo.completed;
      },
      error: (error) => {
        console.error('Error toggling todo:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  editTodo(todo: Todo) {
    if (todo.isEditing) {
      this.updateTodo(todo);
    } else {
      todo.isEditing = true;
      todo.editTitle = todo.title;
    }
  }

  updateTodo(todo: Todo) {
    if (todo.editTitle?.trim()) {
      this.isLoading = true;
      this.todoService.updateTodo(todo).subscribe({
        next: () => {
          todo.title = todo.editTitle!;
          todo.isEditing = false;
        },
        error: (error) => {
          console.error('Error updating todo:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  deleteTodo(todo: Todo) {
    if (confirm('Are you sure you want to delete this todo?')) {
      this.isLoading = true;
      this.todoService.deleteTodo(todo.id).subscribe({
        next: () => {
          this.todos = this.todos.filter(t => t.id !== todo.id);
        },
        error: (error) => {
          console.error('Error deleting todo:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  searchTodos() {
    console.log('Searching for:', this.searchTerm);
    this.isSearching = true;
    this.todoService.searchTodos(this.searchTerm).subscribe({
      next: (todos) => {
        console.log('Search results:', todos);
        this.todos = todos;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error fetching search results:', error);
        this.isSearching = false;
      }
    });
  }
}
