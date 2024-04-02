import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/usermodal.js";

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Determine the role based on isAdmin and isSubAdmin fields
    let role;
    if (user.isAdmin) {
      role = "admin";
    } else if (user.isSubAdmin) {
      role = "sub-admin";
    } else {
      role = "user";
    }

    // Generate JWT token with user's ID and role
    const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send the token and user's role in the response
    res.json({ token, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserRole = async (req, res) => {
  try {
    // Get the JWT token from the request headers
    const token = req.headers.authorization.split(" ")[1];

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Get the user ID from the decoded token
    const userId = decodedToken.userId;

    // Fetch the user from the database based on the user ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine the user's role
    let role;
    if (user.isAdmin) {
      role = "admin";
    } else if (user.isSubAdmin) {
      role = "sub-admin";
    } else {
      role = "user";
    }

    // Send the user role data in the response
    res.json({ role, data: user });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: "Go Back And Login My Dear Friend" });
  }
};

export const createSubAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      isAdmin: false,
      isSubAdmin: true,
    });
    await user.save();
    res.status(201).send("Sub-admin created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while creating sub-admin");
  }
};

export const createUserBySubAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      isAdmin: false,
      isSubAdmin: false,
    });
    await user.save();
    res.status(201).send("User created successfully by sub-admin");
  } catch (error) {
    console.error(error);
    res.status(500).send("username is present write a diffrent name");
  }
};

// Get all sub-admin users
export const getAllSubAdmins = async (req, res) => {
  try {
    // Check if the user making the request is an admin
    if (!req.user.role === "admin") {
      return res.status(403).send("Access forbidden");
    }

    // Query all sub-admin users from the database
    const subAdmins = await User.find({ isSubAdmin: true });

    res.status(200).json(subAdmins);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching sub-admin users");
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    // Check if the user making the request is an admin
    if (!req.user.role === "sub-admin") {
      return res.status(403).send("Access forbidden");
    }

    // Query all sub-admin users from the database
    const Users = await User.find({ isAdmin: false } && { isSubAdmin: false });

    res.status(200).json(Users);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching sub-admin users");
  }
};

// Edit sub-admin role
export const editSubAdminRole = async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    // Check if the user making the request is an admin
    if (!req.user.role === "admin") {
      return res.status(403).send("Access forbidden");
    }

    // Update the user's role in the database
    await User.findByIdAndUpdate(userId, { $set: { role: newRole } });

    res.status(200).send("Sub-admin role updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating sub-admin role");
  }
};

// Delete sub-admin
export const deleteSubAdmin = async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if the user making the request is an admin
    if (req.user.role !== "admin") {
      // Check if user is not an admin
      return res.status(403).send("Access forbidden");
    }

    // Delete the user from the database
    await User.findOneAndDelete(userId);

    res.status(200).send("Sub-admin deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while deleting sub-admin");
  }
};

// send money controller to sub admin

// Send amount to sub-admin
export const sendAmount = async (req, res) => {
  const { username, amount } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update the user's balance by adding the sent amount
    user.balance += parseFloat(amount);
    await user.save();

    // Send back the updated balance in the response
    res.status(200).json({ balance: user.balance });
  } catch (error) {
    console.error("Error sending amount:", error);
    res.status(500).send("An error occurred while sending amount");
  }
};

export const sendAmountToSubAdmin = async (req, res) => {
  const { username, amount } = req.body;

  try {
    // Find the sub-admin by username and isSubAdmin true
    const subAdmin = await User.findOne({
      isSubAdmin: true,
    });

    if (!subAdmin) {
      return res
        .status(404)
        .send({ message: "Sub-admin not found or is not a sub-admin" });
    }

    // Check if the sub-admin has sufficient balance
    if (subAdmin.balance < amount) {
      return res.status(400).send({ message: "Insufficient balance" });
    }

    // Update sub-admin's balance by subtracting the sending amount
    subAdmin.balance -= parseFloat(amount);
    await subAdmin.save();

    // Send back the updated sub-admin balance in the response
    res.status(200).json({ subAdminBalance: subAdmin.balance });

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update the user's balance by adding the sent amount
    user.balance += parseFloat(amount);
    await user.save();

    // Send back the updated balance in the response
    // Since we've already sent the response for the sub-admin, we can't send another one here.
    // Instead, you can log the balance update or choose another approach based on your requirements.
  } catch (error) {
    console.error("Error sending amount to sub-admin:", error);
    res.status(500).send("An error occurred while sending amount to sub-admin");
  }
};

// Get Sub Admin data
export const getSubAdminData = async (req, res) => {
  try {
    // Extract the sub-admin ID from the request parameters
    const { subAdminId } = req.params;

    // Find the sub-admin user from the database based on the ID
    const subAdmin = await User.findOne({ _id: subAdminId, isSubAdmin: true });

    // If the sub-admin is not found, return a 404 status
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    // Return the sub-admin data in the response
    res.status(200).json(subAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching sub-admin data");
  }
};

// Logout
export const logout = (req, res) => {
  // Clear session or token (depending on your authentication method)
  // For example, clear JWT token from client-side

  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};

// User Part Like Play A Game
// *****************************************************
export const updateBalance = async (req, res) => {
  try {
    // Retrieve the amount and isWin from the request body
    const { amount, isWin } = req.body;

    // Retrieve user ID from the authenticated user (assuming you're using JWT authentication)
    const userId = req.user.userId;

    // Retrieve the user from the database
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user's balance is sufficient to play the game
    if (user.balance <= 0) {
      return res
        .status(400)
        .json({ message: "Insufficient balance to play the game" });
    }

    // Update the user's balance
    if (isWin) {
      // Double the win amount
      user.balance += amount * 2;
    } else {
      user.balance += amount;
    }

    // Save the updated user object
    await user.save();

    // Send a success response
    res.status(200).json({ message: "Balance updated successfully" });
  } catch (error) {
    console.error("Error updating balance:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating balance" });
  }
};
