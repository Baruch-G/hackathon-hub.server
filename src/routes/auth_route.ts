import express from "express";
const router = express.Router();
import authController from "../controllers/auth_controller";
import swaggerUI from "swagger-ui-express";

router.use('/api-docs', swaggerUI.serve);

router.post("/register", authController.register);

router.post("/google", authController.googleSignin);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.get("/refresh", authController.refresh);

router.get("/users", authController.getAllUsers);


export default router;