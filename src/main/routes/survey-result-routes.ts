import { Router } from 'express'
import { makeSaveSurveyResultController } from '@/main/factories/controllers/survey-result/save-survey-result-controller-factory'
import { adaptRoute } from '@/main/adapter/express-route-adapter'
import { auth } from '@/main/middlewares'

export default (router: Router): void => {
  router.put('/surveys/:surveyId/results', auth, adaptRoute(makeSaveSurveyResultController()))
}