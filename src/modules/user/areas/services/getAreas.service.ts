import { userAreasRepository } from "../repositories/userAreas.repository.js";

export async function getAreasService(id: string) {
  const areas = await userAreasRepository.findAreas(id)

  return areas.map((a) => a.area);
}
