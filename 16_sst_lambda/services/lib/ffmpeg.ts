import { spawnSync } from 'child_process'
import { Logger } from './logger'
import { FFMPEG_BASE_PATH } from '../constant/constant'

const logger = Logger.child({ service: 'ConvertCodec' })

export class Ffmpeg {
  file: string

  outfile: string

  constructor(file: string, outfile: string) {
    this.file = file
    this.outfile = outfile
  }

  private run(options: Array<string>): string | string[] {
    logger.info('convertCodec:', {
      options: `ffmpeg ${options.join(' ')}`,
    })
    const ffmpegProcess = spawnSync(FFMPEG_BASE_PATH, options, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['inherit', 'inherit', 'inherit'],
      encoding: 'utf-8',
    })

    // logger.info({"stdout":spawnResult.output});
    if (ffmpegProcess.status !== 0) {
      logger.error(ffmpegProcess.stderr)
      throw new Error(`ffmpeg exited with ${ffmpegProcess.status}`)
    } else {
      return ffmpegProcess.stdout || ['']
    }
  }

  async version(): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = ['-version']

      try {
        const out = this.run(options)
        let realOut = 'Error'
        if (out != null) {
          realOut = out[1] || ''
        }

        resolve(realOut)
      } catch (error) {
        logger.error(`Failed: ${this.file}`, { error })
        reject(error)
      }
    })
  }
}
