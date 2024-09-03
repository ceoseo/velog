import nextConfig from '@packages/eslint-config/next.mjs'
import { resolve } from 'node:path'

const projectPath = resolve(process.cwd())

/** @type {import("eslint").Linter.Config} */
export default [...nextConfig(projectPath)]