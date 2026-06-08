// backend/src/routes/categoryRoutes.js
// ------------------------------------------------------------
// Maps HTTP methods + URLs to controller functions.
// ------------------------------------------------------------

const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/categoryController");

router.get("/",     controller.getAll);   // GET    /api/categories
router.get("/:id",  controller.getOne);   // GET    /api/categories/:id
router.post("/",    controller.create);   // POST   /api/categories
router.put("/:id",  controller.update);   // PUT    /api/categories/:id
router.delete("/:id", controller.remove); // DELETE /api/categories/:id

module.exports = router;