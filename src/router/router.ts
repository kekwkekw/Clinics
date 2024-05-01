import { Router } from "express";
import {controller} from '../controller/controller';

const router = Router();

router.get('/clinics/city', controller.searchClinicsByCity);
router.get('/clinics/suburb', controller.searchClinicsBySuburb);
router.get('/clinics/state', controller.searchClinicsByState);
router.get('/clinics/postcode', controller.searchClinicsByPostcode);
router.get('/clinics/name', controller.searchClinicsByName);
router.get('/city/info', controller.cityInfo);
router.get('/suburb/info', controller.suburbInfo);

export default router;