import { BlogMaster } from "./blog.entity";

export const blog = [
  { provide: 'BlogRepository', useValue: BlogMaster },
];
