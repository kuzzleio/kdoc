import axios from 'axios'
import cli from 'cli-ux'
import execa from 'execa'
// import inquirer from 'inquirer'
import YAML from 'yaml'

export interface Repo {
  url: string
  doc_version: string
  stable: string
  dev: string
  name: string
  deploy_path: string
  doc_root?: string
}

export const resolveRepoBranch = async (cwd: string) => {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd
    })
    if (stdout.match(/^develop$/)) {
      return 'dev'
    }
    return 'stable'
  } catch (error) {
    return 'stable'
  }
}

export const getRepositories = async (
  repositoryNames: Array<string> = []
): Promise<Array<Repo>> => {
  cli.action.start('Fetching repository list')
  const reposResponse = await axios.get(
    'https://raw.githubusercontent.com/kuzzleio/documentation/develop/.repos/repositories.yml'
  )

  const YMLRepos: Array<Repo> = YAML.parse(reposResponse.data)
  cli.action.stop(`Found ${YMLRepos.length} repos`)

  // if (repositoryNames.length === 0) {
  //   const answers = await inquirer.prompt([{
  //     type: 'checkbox',
  //     message: 'Select the repositories you want',
  //     name: 'repos',
  //     pageSize: 15,
  //     loop: false,
  //     choices: YMLRepos.map(r => ({ name: r.name }))
  //   }])
  //   repositoryNames = answers.repos
  // }

  // if (repositoryNames.length === 1 && repositoryNames[0] === 'all') {
  //   return YMLRepos
  // }

  if (repositoryNames.length === 0) {
    return YMLRepos
  }

  return YMLRepos.filter(
    repo => repositoryNames.includes(repo.name)
  )
}
