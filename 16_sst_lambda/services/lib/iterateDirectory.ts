import { Logger } from '../lib/logger'
import * as fs from 'fs'
import * as path from 'path'

const logger = Logger.child({ service: 'iterateDirectory' })

export async function iterateFolderRecursive(parentPath: string, recurse = true): Promise<string[]> {
  logger.info(`Iterate Directory: ${parentPath}`)
  const found: string[] = []
  const files = await fs.promises.readdir(parentPath, { withFileTypes: true })
  for (const file of files) {
    const filePath = path.join(parentPath, file.name)
    if (file.isDirectory()) {
      found.push(`Directory: ${filePath}`)
      if (recurse) {
        const subfound = await iterateFolderRecursive(filePath)
        found.push(...subfound)
      }
    } else {
      found.push(`File: ${filePath}`)
    }
  }
  return found
}
