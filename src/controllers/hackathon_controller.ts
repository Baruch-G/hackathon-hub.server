import { IHackathon } from "../models/hackathon_model";
import Hackathon from "../models/hackathon_model";
import createController from "./base_controller";
import { Request, Response } from "express";

const hackathonController = createController<IHackathon>(Hackathon);

export const likeHackathon = async (req: Request, res: Response) => {
  const userId = req.body.userId; // Get userId from request body
  const hackathonId = req.params.id; // Get hackathon ID from request params

  if (!userId) {
    return res.status(400).send("User ID is required");
  }

  try {
    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).send("Hackathon not found");
    }

    // Toggle like
    if (hackathon.likes.includes(userId)) {
      // Unlike
      hackathon.likes = hackathon.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Like
      hackathon.likes.push(userId);
    }

    await hackathon.save();
    res.status(200).send(hackathon);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
};

export const addComment = async (req: Request, res: Response) => {
  const { text } = req.body; // Get comment text from request body
  const userId = req.body.userId; // Get user ID from request body
  const hackathonId = req.params.id; // Get hackathon ID from request params

  if (!text || !userId) {
    return res.status(400).send("Text and User ID are required");
  }

  try {
    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).send("Hackathon not found");
    }

    // Create a new comment
    const newComment = {
      user: userId,
      text,
      date: new Date(),
    };

    // Add the new comment to the hackathon
    hackathon.comments.push(newComment);

    await hackathon.save();

    // Populate the user field in the comments
    const updatedHackathon = await Hackathon.findById(hackathonId)
      .populate("creator", "firstName lastName email imgUrl")
      .populate("comments.user", "firstName lastName email imgUrl");

    res.status(201).send(updatedHackathon);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
};

export default hackathonController;
