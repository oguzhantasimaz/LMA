import { Router } from "express";
import swaggerSpec from "../config/swagger";

const router = Router();

/**
 * Return Swagger specification in JSON format
 */
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

export default router;
