import { Controller, Get, Post, Body, Request, Put, Param, Delete, UseGuards, Query, Patch, NotFoundException } from '@nestjs/common';
import { TodoService } from './todo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Todo } from './todo.entity';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get('search')
  async searchTodos(@Request() req, @Query('term') term: string) {
    console.log('Search request received - term:', term, 'userId:', req.user.id);
    const results = await this.todoService.searchTodos(term, req.user.id);
    console.log('Search results:', results);
    return results;
  }

  @Get()
  async findAll(@Request() req) {
    return await this.todoService.findAll(req.user.id);
  }

  @Post()
  async create(@Body('title') title: string, @Request() req) {
    console.log(`Creating new todo with title: "${title}"`);
    return await this.todoService.create(title, req.user.id);
  }

  @Post(':id/completed')
  async toggle(@Param('id') id: string, @Request() req) {
    console.log(`Toggling completion for todo ${id}`);
    const result = await this.todoService.toggle(+id, req.user.id);
    if (!result) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return result;
  }

  @Put(':id')
  async updateTitle(
    @Param('id') id: number,
    @Body('title') title: string,
    @Request() req
  ) {
    console.log(`Updating title for todo ${id} to: "${title}"`);
    const result = await this.todoService.updateTitle(id, title, req.user.id);
    if (!result) {
      throw new NotFoundException(`Todo with ID  not found`);
    }
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    console.log(`Deleting todo ${id}`);
    await this.todoService.delete(+id, req.user.id);
    return { success: true };
  }
}
