/** Settings for the `sanity` command line (schema deploy, typegen, dataset import, CORS…). */
import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./src/sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
});
