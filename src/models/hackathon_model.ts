import mongoose, { Model, Schema } from "mongoose";

interface Location{
    lon: number
    lat : number
}

export interface IHackathon {
    _id: string;
    creator : string;
    location : Location
}

const hackathonSchema = new Schema<IHackathon>({
    _id: {
        type : String
    },
    creator : {
        type : String
    },
    location : {
        type: Location
    }
})

export default mongoose.model<IHackathon>("Hackaton", hackathonSchema);