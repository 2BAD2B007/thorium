import Task from "./task";
import uuid from "uuid";
import App from "../app";

class TaskFlowStep {
  id: string;
  name: string;
  tasks: Task[];
  activeTaskIds: string[];
  completeAll: boolean;
  constructor(params: Partial<TaskFlowStep> = {}) {
    this.id = params.id || uuid.v4();
    this.name = params.name || "Flow Step";
    this.tasks = params.tasks ? params.tasks.map(t => new Task(t)) : [];
    this.activeTaskIds = params.activeTaskIds || [];
    this.completeAll = params.completeAll ?? true;
  }
  get activeTasks() {
    return this.activeTaskIds.map(t => App.tasks.find(tt => tt.id === t));
  }
  get completed() {
    let completed = false;
    if (this.completeAll) {
      // If we can't find any non-verified tasks, the step is completed
      completed = !this.tasks.find(t => t.verified === false);
    } else {
      // If any task is verified, the step is completed
      completed = !!this.tasks.find(t => t.verified);
    }
    return completed;
  }
  rename(name: string) {
    this.name = name;
  }
  addTask(task: Task) {
    const taskObj = new Task(task);
    this.tasks.push(taskObj);
    return taskObj;
  }
  editTask(id: string, task: Task) {
    // Tasks don't edit in place well, so we'll just replace the old one wholesale
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    this.tasks[taskIndex] = new Task({...task, id});
  }
  removeTask(id: string) {
    this.tasks = this.tasks.filter(s => s.id !== id);
  }
  setCompleteAll(completeAll: boolean) {
    this.completeAll = completeAll;
  }
}
function move<T>(array: T[], old_index: number, new_index: number) {
  if (new_index >= array.length) {
    var k = new_index - array.length;
    while (k-- + 1) {
      array.push(undefined);
    }
  }
  array.splice(new_index, 0, array.splice(old_index, 1)[0]);
  return array; // for testing purposes
}
export class TaskFlow {
  id: string;
  class: "TaskFlow" = "TaskFlow";
  simulatorId: string;
  name: string;
  category: string;
  currentStep: number;
  steps: TaskFlowStep[];
  constructor(params: Partial<TaskFlow> = {}) {
    this.id = params.id || uuid.v4();
    this.simulatorId = params.simulatorId || null;
    this.name = params.name || "Task Flow";
    this.category = params.category || "";
    this.currentStep = params.currentStep || 0;
    this.steps = params.steps ? params.steps.map(s => new TaskFlowStep(s)) : [];
  }

  get completed() {
    return this.currentStep >= this.steps.length - 1;
  }
  advance() {
    // Don't advance flows that don't have a simulator id
    if (!this.simulatorId) return;

    // Check if all of the tasks have been completed.
    const currentStep = this.steps[this.currentStep];
    if (!currentStep?.completed && this.currentStep !== -1) return;
    // Increment the current step, assign the next task,
    // and then publish the results.
    this.currentStep++;
    const step = this.steps[this.currentStep];
    step?.tasks.forEach(t => {
      App.handleEvent(
        {
          simulatorId: this.simulatorId,
          taskInput: t,
          cb: (task: string) => step.activeTaskIds.push(task),
        },
        "addTask",
      );
    });
  }
  setName(name: string) {
    this.name = name;
  }
  setCategory(category: string) {
    this.category = category;
  }
  addStep(name: string) {
    const step = new TaskFlowStep({name});
    this.steps.push(step);
    return step;
  }
  removeStep(id: string) {
    this.steps = this.steps.filter(s => s.id !== id);
  }
  renameStep(id: string, name: string) {
    this.steps.find(s => s.id === id)?.rename(name);
  }
  reorderStep(id: string, order: number) {
    this.steps = move(
      this.steps,
      this.steps.findIndex(t => t.id === id),
      order,
    );
  }
  addTask(id: string, task: Task) {
    return this.steps.find(s => s.id === id)?.addTask(task);
  }
  removeTask(id: string, taskId: string) {
    this.steps.find(s => s.id === id)?.removeTask(taskId);
  }
  editTask(id: string, taskId: string, task: Task) {
    this.steps.find(s => s.id === id)?.editTask(taskId, task);
  }
  setCompleteAll(id: string, completeAll: boolean) {
    this.steps.find(s => s.id === id)?.setCompleteAll(completeAll);
  }
}
