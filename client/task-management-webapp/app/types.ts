export interface Task {
  id: string;
  title: string;
  dueDate: string;
  stage: "Not started" | "In progress" | "Completed";
  priority: "Low" | "Medium" | "High";
}