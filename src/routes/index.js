const express = require("express");
const userRouter = require("./user.routes");
const roleRouter = require("./role.routes");
const authRouter = require("./auth.routes");
const documentRouter = require("./document.routes");
const mediaRouter = require("./media.routes");
const purchaseRouter = require("./purchase.routes");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/roles", roleRouter);
router.use("/documents", documentRouter);
router.use("/media", mediaRouter);
router.use("/purchases", purchaseRouter);

module.exports = router;
