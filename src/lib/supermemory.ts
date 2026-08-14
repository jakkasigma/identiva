import Supermemory from "supermemory"

let client: Supermemory | null = null

export function getSupermemoryClient(): Supermemory {
  if (!client) {
    client = new Supermemory()
  }
  return client
}

export async function addMemory(
  content: string,
  containerTag: string,
  metadata?: Record<string, any>
) {
  const client = getSupermemoryClient()
  return await client.documents.add({
    content,
    containerTag,
    metadata,
  })
}

export async function searchMemory(
  query: string,
  containerTag: string,
  limit?: number
) {
  const client = getSupermemoryClient()
  const { results } = await client.search.execute({
    q: query,
    containerTag,
    limit,
  })
  return results
}

export async function clearMemory(containerTag: string) {
  const client = getSupermemoryClient()
  return await client.documents.deleteBulk({ containerTags: [containerTag] })
}
