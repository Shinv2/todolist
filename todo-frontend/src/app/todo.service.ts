import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  isEditing?: boolean;
  editTitle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:3000/todos';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  private getOptions() {
    return {
      headers: this.getHeaders(),
      withCredentials: true
    };
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      // AuthInterceptor will handle the redirect
      return throwError(() => new Error('Unauthorized'));
    }
    return throwError(() => new Error('An error occurred. Please try again later.'));
  }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  Todo(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  toggleTodo(id: number): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/${id}/completed`, {}, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  updateTodo( update:Todo): Observable<Todo> {
    console.log("update",update)
    const payload = { title: update.editTitle };
    return this.http.put<Todo>(`${this.apiUrl}/${update.id}`, payload, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  searchTodos(term: string): Observable<Todo[]> {
    console.log('Making search request with term:', term);
    const params = new HttpParams().set('term', term || '');
    return this.http.get<Todo[]>(`${this.apiUrl}/search`, {
      ...this.getOptions(),
      params
    }).pipe(
      catchError((error) => {
        console.error('Search request error:', error);
        return this.handleError(error);
      })
    );
  }
}
