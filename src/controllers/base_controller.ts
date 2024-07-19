import { Request, Response } from "express";
import { Model } from "mongoose";

export class BaseController<T> {
    model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async get(req: Request, res: Response) {
        try {
            const query = req.query.name ? { name: req.query.name } : {};
            const documents = await this.model.find(query)
                .populate('creator', 'firstName lastName email imgUrl')
                .populate({
                    path: 'comments.user',
                    select: 'firstName lastName email imgUrl'
                });
            res.send(documents);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const document = await this.model.findById(req.params.id)
                .populate('creator', 'firstName lastName email imgUrl')
                .populate({
                    path: 'comments.user',
                    select: 'firstName lastName email imgUrl'
                });
            res.send(document);
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

    async putById(req: Request, res: Response) {
        try {
            const updatedDocument = await this.model.findByIdAndUpdate(req.params.id, req.body, { new: true })
                .populate('creator', 'firstName lastName email imgUrl')
                .populate({
                    path: 'comments.user',
                    select: 'firstName lastName email imgUrl'
                });
            res.send(updatedDocument);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }

    async deleteById(req: Request, res: Response) {
        try {
            await this.model.findByIdAndDelete(req.params.id);
            res.status(204).send();
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
}

const createController = <T>(model: Model<T>) => {
    return new BaseController<T>(model);
};

export default createController;
