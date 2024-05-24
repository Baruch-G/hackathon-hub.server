import { Request, Response } from "express";
import { Model } from "mongoose";

export class BaseController<T>{
    model: Model<T>
    constructor(model: Model<T>) {
        this.model = model;
    }

    async get(req: Request, res: Response) {
        try {
            if (req.query.name) {
                const students = await this.model.find({ name: req.query.name });
                res.send(students);
            } else {
                const students = await this.model.find();
                res.send(students);
            }
        } catch (err : any) {
            res.status(500).json({ message: err.message });
        }
    }
    
    async getById(req: Request, res: Response) {
        try {
            const student = await this.model.findById(req.params.id);
            res.send(student);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    async post(req: Request, res: Response) {
        try {
            const obj = await this.model.create(req.body);
            res.status(201).send(obj);
        } catch (err: any) {
            console.log(err);
            res.status(406).send("fail: " + err.message);
        }
    }

    putById(req: Request, res: Response) {
        res.send("put student by id: " + req.params.id);
    }

    deleteById(req: Request, res: Response) {
        res.send("delete student by id: " + req.params.id);
    }
}

const createController = <T>(model: Model<T>) => {
    return new BaseController<T>(model);
}

export default createController;