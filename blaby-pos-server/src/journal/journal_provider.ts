import { Journal } from "./journal_model";

export const journalProvider = [{provide :'JournalRepository' ,useValue:Journal}]