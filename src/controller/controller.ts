import { Request, Response, NextFunction } from 'express';
import {db} from "../db/db";

function tryCatchDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(req: Request, res: Response, next: NextFunction) {
        try {
            await originalMethod.call(this, req, res, next);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    return descriptor;
}

class Controller{

    @tryCatchDecorator
    public async searchClinicsByCity(req: Request, res: Response) {
        const city = req.query.city as string;
        const clinics = await db.searchClinicsByCity(city);
        res.json(clinics);
    }

    @tryCatchDecorator
    public async searchClinicsBySuburb(req: Request, res: Response) {
        const suburb = req.query.suburb as string;
        const clinics = await db.searchClinicsBySuburb(suburb);
        res.json(clinics);
    }

    @tryCatchDecorator
    public async searchClinicsByState(req: Request, res: Response) {
        const state = req.query.state as string;
        const clinics = await db.searchClinicsByState(state);
        res.json(clinics);
    }

    @tryCatchDecorator
    public async searchClinicsByPostcode(req: Request, res: Response) {
        const postcode = req.query.postcode as string;
        const clinics = await db.searchClinicsByPostcode(postcode);
        res.json(clinics);
    }

    @tryCatchDecorator
    public async searchClinicsByName(req: Request, res: Response) {
        const name = req.query.name as string;
        const suburbs = await db.searchClinicsByName(name);
        res.json(suburbs);
    }

    @tryCatchDecorator
    public async cityInfo(req: Request, res: Response) {
        const slug = req.query.slug as string;
        const city = await db.cityInfo(slug);
        res.json(city);
    }

    @tryCatchDecorator
    public async suburbInfo(req: Request, res: Response) {
        const slug = req.query.slug as string;
        const suburb = await db.suburbInfo(slug);
        res.json(suburb);
    }

    @tryCatchDecorator
    public async clinicInfo(req: Request, res: Response) {
        const slug = req.query.slug as string;
        const clinic = await db.clinicInfo(slug);
        res.json(clinic);
    }
}

const controller = new Controller();
export {controller}