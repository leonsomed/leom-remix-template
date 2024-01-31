export interface AddTodoEvent {
  type: "addTodo";
  id: string;
  text: string;
}

export interface DeleteTodoEvent {
  type: "deleteTodo";
  id: string;
  text2: string;
}

export type AppEvent = AddTodoEvent | DeleteTodoEvent;
