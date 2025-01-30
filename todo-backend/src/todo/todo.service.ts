import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  findAll(userId: number): Promise<Todo[]> {
    return this.todoRepository.find({
      where: { userId },
    });
  }

  create(title: string, userId: number): Promise<Todo> {
    const todo = this.todoRepository.create({
      title,
      userId,
      completed: false
    });
    return this.todoRepository.save(todo);
  }

  async toggle(id: number, userId: number): Promise<Todo | undefined> {
    const todo = await this.todoRepository.findOne({
      where: { id, userId },
    });
    if (todo) {
      todo.completed = !todo.completed;
      return this.todoRepository.save(todo);
    }
    return undefined;
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.todoRepository.delete({ id, userId });
  }

  async updateTitle(id: number, title: string, userId: number): Promise<Todo | undefined> {
    console.log("-----------------")
    try {
      const todo = await this.todoRepository.findOne({
        where: { id, userId },
      });
  
      console.log("todo:", todo);
      
      if (!todo) {
        return undefined;
      }
  
      // Update the todo directly and save it
      todo.title = title;
      const updatedTodo = await this.todoRepository.save(todo);
      
      console.log('Todo updated in database ----------:', updatedTodo);
      return updatedTodo;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }


  //sdsf
  async searchTodos(term: string, userId: number): Promise<Todo[]> {
    console.log('Searching todos - term:', term, 'userId:', userId);
    
    if (!term) {
      console.log('Empty search term, returning all todos');
      return this.findAll(userId);
    }
      
    const query = this.todoRepository
      .createQueryBuilder('todo')
      .where('todo.userId = :userId', { userId })
      .andWhere('LOWER(todo.title) LIKE LOWER(:term)', { 
        term: `%${term}%` 
      });

    console.log('Search query:', query.getSql());
    const results = await query.getMany();
    console.log('Search results:', results);
    return results;
  }
}
