import { Subscriptions } from "../subscriptions/subscriptions.entity";
import { CompanyMaster } from "./company_master_entity";

export const CompanyMasterProviders = [
  { provide: "CompanyMasterRepository", useValue: CompanyMaster },
  { provide: "SubscriptionsRepository", useValue: Subscriptions },
];
