import { Router } from 'express'
import { sendAnalytics, trackAction } from './handlers';


const router = Router()



router.post("/track", trackAction)
router.get("/analytics", sendAnalytics)


export default router;