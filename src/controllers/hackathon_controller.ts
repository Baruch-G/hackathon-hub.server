import { IHackathon } from "../models/hackathon_model";
import Hackathon from "../models/hackathon_model";

import createController from "./base_controller";

const hackathonController = createController<IHackathon>(Hackathon);

export default hackathonController;
 