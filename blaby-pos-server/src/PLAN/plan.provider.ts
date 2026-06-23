import { Plan } from "./plan.entity";

export const PlanProvider = [
  { provide: "PlanRepository", useValue: Plan },
];
