import axios from 'axios'
import axiosRetry from 'axios-retry'
import cron from 'node-cron'
import env from '@/main/config/environment-variables'
import { University } from '@/domain/entities/university'
import { UniversityModel } from '@/infra/mongodb/schemas/university'
import { mongooseHelper } from '@/infra/mongodb/helper'
import { UpdateModel } from '@/infra/mongodb/schemas/update'

const currentHours = new Date().getHours()

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000
  },
})

function mapToModel(universities: any[]): University[] {
  return universities.flatMap((university) => ({
    stateProvince: university['state-province'],
    alphaTwoCode: university['alpha_two_code'],
    webPages: university['web_pages'],
    country: university['country'],
    name: university['name'],
    domains: university['domains'],
  }))
}

async function populateDatabase() {
  const countries = [
    'argentina',
    'brazil',
    'chile',
    'colombia',
    'paraguay',
    'peru',
    'suriname',
    'uruguay',
  ]
  const universities = await Promise.all(
    countries.map((country) => fetchUniversities(country))
  )
  const universitiesToSave = mapToModel(universities.flat())

  await mongooseHelper.connect(`${env.mongoUrl}/universities`)
  await insertManyWithRetry(universitiesToSave)
}

async function insertManyWithRetry(universities: University[]) {
  const maxRetries = 5
  let retries = 0

  while (retries < maxRetries) {
    try {
      await UniversityModel.deleteMany({})
      await UniversityModel.insertMany(universities)
      await UpdateModel.create({
        generatedAt: new Date(),
      })
      console.log('Registros inseridos com sucesso')

      return
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(
          'Erro ao inserir registros, tentando novamente...',
          e.message
        )
        retries++
        console.log(`Tentativa ${retries} de ${maxRetries}`)
      }
    }
  }
}

async function fetchUniversities(country: string): Promise<void> {
  try {
    const { data } = await axios.get(
      `http://universities.hipolabs.com/search?country=${country}`
    )
    return data
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      console.error(
        'Erro ao carregar universidades, tente novamente mais tarde'
      )
    }
  }
}

populateDatabase()
console.log('Now running every 24 hours...')
cron.schedule(`0 ${currentHours} * * *`, populateDatabase)
