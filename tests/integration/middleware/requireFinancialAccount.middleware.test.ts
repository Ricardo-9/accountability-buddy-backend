import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "../../../src/lib/prisma";
import { requireFinancialAccount } from "../../../src/modules/finance/middlewares/requireFinancialAccount";
import { AppError } from "../../../src/core/errors/AppError";

vi.mock("../../../src/lib/prisma", () => ({
  prisma: {
    financeAccount: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Require financial account middleware test", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should call next() when financial account exists", async () => {
    vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue({
      id: "acc-id",
    } as any);

    const req = {
      user: {
        id: "userId",
      },
    } as any;
    const next = vi.fn();

    await requireFinancialAccount(req, {} as any, next);

    expect(prisma.financeAccount.findUnique).toHaveBeenCalledWith({
      where: { userId: "userId" },
      select: { id: true },
    });
    expect(next).toHaveBeenCalled();
  });

  it("should call next(AppError) with 404 (NOT_FOUND) when the user financiaal account is not found", async () => {
    vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue(null);

    const req = {
      user: {
        id: "userId",
      },
    } as any;
    const next = vi.fn();

    await requireFinancialAccount(req, {} as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
  });
});
