import { AccountabilityArea } from "@prisma/client";
import { userAreasRepository } from "../repositories/userAreas.repository.js";

export async function updateAreasService(
  id: string,
  areas: AccountabilityArea[],
) {
  const createdAreas = await userAreasRepository.replaceUserAreas(id, areas)

  return createdAreas.map((a) => a.area);
}
