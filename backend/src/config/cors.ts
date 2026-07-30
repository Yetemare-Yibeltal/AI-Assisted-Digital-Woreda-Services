import cors from "cors";
import appConfig from "./app";

const corsOptions = appConfig.cors;
export default cors(corsOptions);
