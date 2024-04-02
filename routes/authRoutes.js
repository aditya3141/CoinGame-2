import express from "express";
import {
  loginUser,
  createSubAdmin,
  createUserBySubAdmin,
  editSubAdminRole,
  deleteSubAdmin,
  getAllSubAdmins,
  logout,
  getUserRole,
  sendAmount,
  getSubAdminData,
  getAllUsers,
  sendAmountToSubAdmin,
  updateBalance,
} from "../controllers/authController.js";
import {
  authenticateToken,
  isAdmin,
  isSubAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);

// Route to get user role data
router.get("/success", getUserRole);

// Main admin can create sub-admin
router.post("/register-sub-admin", authenticateToken, isAdmin, createSubAdmin);

// Send amount to sub-admin
router.post("/send-amount", authenticateToken, isAdmin, sendAmount);

// send user amount
router.post(
  "/send-user-amount",
  authenticateToken,
  isSubAdmin,
  sendAmountToSubAdmin
);

// Get sub-admin balance
// GET route to fetch the amount sent to a Sub Admin

// Sub-admin can create regular user
router.post(
  "/register-user",
  authenticateToken,
  isSubAdmin,
  createUserBySubAdmin
);

// Edit sub-admin role route
router.put(
  "/edit-sub-admin-role",
  authenticateToken,
  isAdmin,
  editSubAdminRole
);
// get all subadminx
router.get("/sub-admins", authenticateToken, isAdmin, getAllSubAdmins);

// get all users
router.get("/get-all-users", authenticateToken, isSubAdmin, getAllUsers);

// Delete sub-admin route
router.delete(
  "/delete-sub-admin/:id",
  authenticateToken,
  isAdmin,
  deleteSubAdmin
);

// Route to fetch Sub Admin data
router.get("/user/:subAdminId", authenticateToken, isAdmin, getSubAdminData);
// Logout route
router.post("/logout", logout);

// Create a User Part
// Route to update user balance
router.post("/updateBalance", authenticateToken, updateBalance);
export default router;
