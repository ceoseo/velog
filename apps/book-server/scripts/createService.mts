import { CreateServiceScript } from '@packages/scripts'
import { URL } from 'url'

const __dirname = new URL('.', import.meta.url).pathname
const createServiceScript = new CreateServiceScript({ __dirname })
createServiceScript.excute()
