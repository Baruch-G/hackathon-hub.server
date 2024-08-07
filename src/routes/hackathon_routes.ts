import hackathonController, {
    addComment,
  likeHackathon,
} from "../controllers/hackathon_controller";
import express from "express";
const router = express.Router();

router.get("/", hackathonController.get.bind(hackathonController));
router.get("/:id", hackathonController.getById.bind(hackathonController));
router.post("/", hackathonController.post.bind(hackathonController));
router.put("/:id", hackathonController.putById.bind(hackathonController));
router.delete("/:id", hackathonController.deleteById.bind(hackathonController));

router.post("/:id/like", likeHackathon);
router.post("/:id/comment", addComment);

export default router;
