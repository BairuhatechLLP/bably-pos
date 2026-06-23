import { Affiliations } from "./affiliations-model";

export const affiliationsProviders = [
  { provide: "AffiliationsRepository", useValue: Affiliations },
];
