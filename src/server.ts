import app from "./app.js";
import { executeRecurringTransactionJob } from "./modules/finance/recurring-transactions/jobs/executeRecurringTransaction.job.js";

executeRecurringTransactionJob();

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
