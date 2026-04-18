import { describe, expect, it, vi, beforeEach } from "vitest";
import {variableExpenseRepository} from "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository";
import { Prisma } from "@prisma/client";
import {deleteVariableExpenseService} from "../../../../../src/modules/finance/variable-expenses/services/deleteVariableExpense.service"