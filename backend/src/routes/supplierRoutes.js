// backend/src/routes/supplierRoutes.js
// ------------------------------------------------------------
// Maps HTTP methods + URLs to controller functions.
// ------------------------------------------------------------

const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/supplierController");

router.get("/",       controller.getAll);   // GET    /api/suppliers
router.get("/:id",    controller.getOne);   // GET    /api/suppliers/:id
router.post("/",      controller.create);   // POST   /api/suppliers
router.put("/:id",    controller.update);   // PUT    /api/suppliers/:id
router.delete("/:id", controller.remove);   // DELETE /api/suppliers/:id

module.exports = router;