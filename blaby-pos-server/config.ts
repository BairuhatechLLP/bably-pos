import * as dotEnv from "dotenv";
// Load .env variables
dotEnv.config();
import { config as envConfig } from "./config/envconfig"; // Import env config
export default envConfig;
