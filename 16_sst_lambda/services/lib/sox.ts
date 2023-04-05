import { spawnSync } from 'child_process'
import { Logger } from './logger'
import { SOX_BASE_PATH } from '../constant/constant'

const logger = Logger.child({ service: 'Sox' })

/**
 * @description SoxTrim is used to manage the external sox process.
 * We use Sox to trim off the buffer that is left behind at the end of a decoded AAC file.
 * We know that all the segments sent comply with a specific duration.
 * We therefore trim back to the duration.
 */
export class Sox {
  file: string

  outfile: string

  constructor(file: string, outfile: string) {
    this.file = file
    this.outfile = outfile
  }

  private run(options: Array<string>): (string | null)[] {
    logger.info('Sox spawn', { options: `sox ${options.join(' ')}` })
    logger.info(process.env)
    // TODO: Make sure this does not grow......
    process.env['LD_LIBRARY_PATH'] = (process.env['LD_LIBRARY_PATH'] || '') + ':/opt/sox/libs/lib64'

    const spawnResult = spawnSync(SOX_BASE_PATH, options, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['inherit', 'inherit', 'inherit'],
      encoding: 'utf-8',
    })
    // logger.info({"stdout":spawnResult.output});
    if (spawnResult.status !== 0) {
      throw new Error(`sox exited with ${spawnResult.status}`)
    } else {
      return spawnResult.output || ['']
    }
  }

  async version(): Promise<string> {
    return new Promise((resolve, reject) => {
      // sox "${OUTPATH}/${_outfile}.wav" "${OUTPATH}/${_outfile}.trim.wav" trim 0 1
      const options = ['--version']

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
