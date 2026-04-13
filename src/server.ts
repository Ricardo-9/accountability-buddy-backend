import app from "./app.js";
import { config } from "./config/env.js";
import { executeRecurringTransactionJob } from "./modules/finance/jobs/executeRecurringTransaction.job.js";

executeRecurringTransactionJob();

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
